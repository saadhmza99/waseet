SELECT
  (SELECT count(*) FROM profiles WHERE profession ILIKE '%promotion%') AS by_profession,
  (SELECT count(*) FROM profiles p
     JOIN internal_categories ic ON ic.id = p.internal_category_id
    WHERE ic.code = '1.2.1') AS by_profile_fk,
  (SELECT count(DISTINCT pic.profile_id)
     FROM profile_internal_categories pic
     JOIN internal_categories ic ON ic.id = pic.internal_category_id
    WHERE ic.code = '1.2.1') AS by_junction,
  (SELECT count(*) FROM profiles p
     JOIN internal_categories ic ON ic.id = p.internal_category_id
    WHERE ic.code = '1.2.1'
      AND NOT EXISTS (
        SELECT 1 FROM profile_internal_categories pic
        WHERE pic.profile_id = p.id AND pic.internal_category_id = p.internal_category_id
      )) AS missing_junction;
