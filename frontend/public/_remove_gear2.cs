using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class LogoEdit2 {
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
    int sample = (int)(h * 0.42) * stride + (w / 2) * 4;
    int bB = px[sample], bG = px[sample + 1], bR = px[sample + 2];
    int changed = 0;
    int x0 = (int)(w * 0.38), x1 = (int)(w * 0.62), y0 = (int)(h * 0.48), y1 = (int)(h * 0.78);
    for (int y = y0; y <= y1; y++) {
      for (int x = x0; x <= x1; x++) {
        int i = y * stride + x * 4;
        int r = px[i + 2], gch = px[i + 1], b = px[i];
        if (r > 200 && gch > 200 && b > 200) continue;
        bool nearArch = false;
        for (int oy = -2; oy <= 2 && !nearArch; oy++) {
          for (int ox = -2; ox <= 2; ox++) {
            int nx = x + ox, ny = y + oy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            int j = ny * stride + nx * 4;
            if (px[j + 2] > 200 && px[j + 1] > 200 && px[j] > 200) { nearArch = true; break; }
          }
        }
        if (nearArch) continue;
        int dist = Math.Abs(r - bR) + Math.Abs(gch - bG) + Math.Abs(b - bB);
        if (dist > 18) {
          px[i] = (byte)bB; px[i + 1] = (byte)bG; px[i + 2] = (byte)bR; px[i + 3] = 255;
          changed++;
        }
      }
    }
    Marshal.Copy(px, 0, data.Scan0, px.Length);
    bmp.UnlockBits(data);
    bmp.Save(destPath, ImageFormat.Jpeg);
    bmp.Dispose();
    Console.WriteLine("changed " + changed + " bg " + bR + "," + bG + "," + bB);
  }
}
