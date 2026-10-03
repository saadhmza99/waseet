using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class LogoEdit {
  public static void Run(string srcPath, string destPath) {
    byte[] file = File.ReadAllBytes(srcPath);
    Bitmap bmp;
    using (var ms = new MemoryStream(file))
    using (var loaded = new Bitmap(ms)) {
      bmp = new Bitmap(loaded.Width, loaded.Height, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(loaded, 0, 0, loaded.Width, loaded.Height);
    }
    int w = bmp.Width, h = bmp.Height;
    var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int stride = data.Stride;
    byte[] px = new byte[stride * h];
    Marshal.Copy(data.Scan0, px, 0, px.Length);
    var seen = new bool[w * h];
    var comps = new List<List<int>>();
    int[] dx = { -1, 1, 0, 0 };
    int[] dy = { 0, 0, -1, 1 };
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        int start = y * w + x;
        if (seen[start] || px[y * stride + x * 4 + 2] <= 210 || px[y * stride + x * 4 + 1] <= 210 || px[y * stride + x * 4] <= 210) continue;
        var q = new Queue<int>();
        var pts = new List<int>();
        q.Enqueue(start);
        seen[start] = true;
        while (q.Count > 0) {
          int cur = q.Dequeue();
          pts.Add(cur);
          int cx = cur % w, cy = cur / w;
          for (int k = 0; k < 4; k++) {
            int nx = cx + dx[k], ny = cy + dy[k];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            int ni = ny * w + nx;
            if (seen[ni] || px[ny * stride + nx * 4 + 2] <= 210 || px[ny * stride + nx * 4 + 1] <= 210 || px[ny * stride + nx * 4] <= 210) continue;
            seen[ni] = true;
            q.Enqueue(ni);
          }
        }
        comps.Add(pts);
      }
    }
    comps.Sort((a, b) => b.Count.CompareTo(a.Count));
    var arch = new HashSet<int>(comps[0]);
    List<int> gear = null;
    for (int i = 1; i < comps.Count; i++) {
      if (comps[i].Count > 40) { gear = comps[i]; break; }
    }
    if (gear == null) throw new Exception("gear not found");
    int minX = w, minY = h, maxX = 0, maxY = 0;
    foreach (int p in gear) {
      int x = p % w, y = p / w;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    int bgI = Math.Max(0, minY - 24) * stride + ((minX + maxX) / 2) * 4;
    byte bB = px[bgI], bG = px[bgI + 1], bR = px[bgI + 2];
    var gearSet = new HashSet<int>(gear);
    foreach (int p in gear) {
      int i = (p / w) * stride + (p % w) * 4;
      px[i] = bB; px[i + 1] = bG; px[i + 2] = bR; px[i + 3] = 255;
    }
    for (int y = Math.Max(0, minY - 3); y <= Math.Min(h - 1, maxY + 3); y++) {
      for (int x = Math.Max(0, minX - 3); x <= Math.Min(w - 1, maxX + 3); x++) {
        int id = y * w + x;
        if (arch.Contains(id)) continue;
        int i = y * stride + x * 4;
        if (px[i + 2] > 150 && px[i + 1] > 150 && px[i] > 130) {
          px[i] = bB; px[i + 1] = bG; px[i + 2] = bR; px[i + 3] = 255;
        }
      }
    }
    Marshal.Copy(px, 0, data.Scan0, px.Length);
    bmp.UnlockBits(data);
    bmp.Save(destPath, ImageFormat.Jpeg);
    bmp.Dispose();
    Console.WriteLine("ok " + w + "x" + h + " gear " + gear.Count + " arch " + comps[0].Count);
  }
}
