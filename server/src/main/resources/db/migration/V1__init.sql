-- WarmPaws 初始化表结构
CREATE TABLE IF NOT EXISTS app_user (
  id BIGINT NOT NULL AUTO_INCREMENT,
  openid VARCHAR(64) NOT NULL,
  nickname VARCHAR(20) NOT NULL DEFAULT '微信用户',
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_user_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_user (
  id BIGINT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  nickname VARCHAR(50) NOT NULL DEFAULT '管理员',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS animal (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  age VARCHAR(20) NOT NULL,
  breed VARCHAR(50) NOT NULL DEFAULT '',
  sterilized TINYINT(1) NOT NULL DEFAULT 0,
  vaccinated TINYINT(1) NOT NULL DEFAULT 0,
  health VARCHAR(200) NOT NULL DEFAULT '',
  location VARCHAR(50) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  cover VARCHAR(500) NOT NULL DEFAULT '',
  images JSON NULL,
  story VARCHAR(1000) NOT NULL DEFAULT '',
  tags JSON NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'official',
  submission_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_animal_status (status),
  KEY idx_animal_type (type),
  KEY idx_animal_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notice (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notice_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorite (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  animal_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_favorite_user_animal (user_id, animal_id),
  KEY idx_favorite_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS adoption (
  id BIGINT NOT NULL AUTO_INCREMENT,
  animal_id BIGINT NOT NULL,
  animal_name VARCHAR(20) NOT NULL,
  animal_type VARCHAR(10) NOT NULL,
  user_id BIGINT NULL,
  applicant_name VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL DEFAULT '',
  wechat VARCHAR(50) NOT NULL DEFAULT '',
  housing VARCHAR(200) NOT NULL DEFAULT '',
  experience VARCHAR(500) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  remark VARCHAR(200) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_adoption_user (user_id, status),
  KEY idx_adoption_animal (animal_id, status),
  KEY idx_adoption_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  content VARCHAR(500) NOT NULL,
  contact VARCHAR(50) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feedback_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS animal_submission (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NULL,
  type VARCHAR(10) NOT NULL,
  name VARCHAR(20) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  age VARCHAR(20) NOT NULL,
  breed VARCHAR(50) NOT NULL DEFAULT '',
  sterilized TINYINT(1) NOT NULL DEFAULT 0,
  vaccinated TINYINT(1) NOT NULL DEFAULT 0,
  health VARCHAR(200) NOT NULL DEFAULT '',
  location VARCHAR(50) NOT NULL DEFAULT '',
  story VARCHAR(500) NOT NULL DEFAULT '',
  images JSON NOT NULL,
  contact_name VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL DEFAULT '',
  wechat VARCHAR(50) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reject_code VARCHAR(30) NOT NULL DEFAULT '',
  reject_reason VARCHAR(200) NOT NULL DEFAULT '',
  animal_id BIGINT NULL,
  sec_check VARCHAR(20) NOT NULL DEFAULT 'skipped',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewer_id BIGINT NULL,
  PRIMARY KEY (id),
  KEY idx_submission_user (user_id, status),
  KEY idx_submission_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS agreement (
  id BIGINT NOT NULL AUTO_INCREMENT,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(50) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_agreement_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
