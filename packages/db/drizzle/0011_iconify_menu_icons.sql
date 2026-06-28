UPDATE "admin_menus"
SET "icon" = CASE "icon"
  WHEN 'HomeOutlined' THEN 'ant-design:home-outlined'
  WHEN 'BookOutlined' THEN 'ant-design:book-outlined'
  WHEN 'AppstoreOutlined' THEN 'ant-design:appstore-outlined'
  WHEN 'TagsOutlined' THEN 'ant-design:tags-outlined'
  WHEN 'ReadOutlined' THEN 'ant-design:read-outlined'
  WHEN 'UserOutlined' THEN 'ant-design:user-outlined'
  WHEN 'TeamOutlined' THEN 'ant-design:team-outlined'
  WHEN 'MenuOutlined' THEN 'ant-design:menu-outlined'
  WHEN 'SettingOutlined' THEN 'ant-design:setting-outlined'
  ELSE "icon"
END
WHERE "icon" IN (
  'HomeOutlined',
  'BookOutlined',
  'AppstoreOutlined',
  'TagsOutlined',
  'ReadOutlined',
  'UserOutlined',
  'TeamOutlined',
  'MenuOutlined',
  'SettingOutlined'
);
