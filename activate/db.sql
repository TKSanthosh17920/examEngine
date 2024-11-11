--
-- Table structure for table `autoInc`
--

DROP TABLE IF EXISTS `autoInc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `autoInc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `autoid` int(11) DEFAULT NULL,
  `center_code` varchar(50) DEFAULT NULL,
  `serverno` varchar(2) DEFAULT 'A',
  `download_start` datetime DEFAULT NULL,
  `status` smallint(6) DEFAULT '0',
  `common_path` varchar(256) NOT NULL,
  `centre_path` varchar(256) NOT NULL,
  `qp_path` varchar(256) DEFAULT NULL,
  `photo_path` varchar(256) DEFAULT NULL,
  `sign_path` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `autofeed`
--

DROP TABLE IF EXISTS `autofeed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `autofeed` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `center_code` varchar(50) DEFAULT NULL,
  `serverno` varchar(2) DEFAULT NULL,
  `autoid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bulk_audit_trail`
--

DROP TABLE IF EXISTS `bulk_audit_trail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bulk_audit_trail` (
  `logged_ip` varchar(15) DEFAULT NULL,
  `logged_userid` int(4) DEFAULT NULL,
  `login_time` datetime DEFAULT NULL,
  `logout_time` datetime DEFAULT NULL,
  `log_id` int(4) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`log_id`)
) ENGINE=MyISAM AUTO_INCREMENT=255 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bulk_keys`
--

DROP TABLE IF EXISTS `bulk_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bulk_keys` (
  `key_id` int(4) NOT NULL AUTO_INCREMENT,
  `key_value` varchar(255) NOT NULL DEFAULT '',
  `is_active` char(1) DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`key_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bulk_log`
--

DROP TABLE IF EXISTS `bulk_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bulk_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `fileaccessed` text,
  `browser` text,
  `referrer` text,
  `access_time` datetime DEFAULT NULL,
  `argument` text,
  PRIMARY KEY (`log_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7173 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bulk_session`
--

DROP TABLE IF EXISTS `bulk_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bulk_session` (
  `sid` varchar(100) NOT NULL DEFAULT '',
  `value` varchar(255) DEFAULT NULL,
  `expire_time` int(14) unsigned DEFAULT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config` (
  `appid` int(5) DEFAULT NULL,
  `appuser` varchar(50) DEFAULT NULL,
  `apppass` varchar(50) DEFAULT NULL,
  `appservice` varchar(50) DEFAULT NULL,
  `host` varchar(50) DEFAULT NULL,
  `hostuser` varchar(50) DEFAULT NULL,
  `hostpass` varchar(50) DEFAULT NULL,
  `hostdb` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `descriptive_answer`
--

DROP TABLE IF EXISTS `descriptive_answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `descriptive_answer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `response_id` int(11) DEFAULT NULL,
  `question_id` int(11) DEFAULT NULL,
  `question_paper_no` int(11) DEFAULT NULL,
  `desc_ans` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `excelfiles`
--

DROP TABLE IF EXISTS `excelfiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `excelfiles` (
  `file_id` int(4) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(100) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(10) DEFAULT NULL,
  `language` varchar(5) DEFAULT NULL,
  `format_type` enum('Q','CD','DQ') DEFAULT 'Q',
  `question_sid` int(11) DEFAULT NULL,
  `question_eid` int(11) DEFAULT NULL,
  `is_imported` varchar(50) DEFAULT NULL,
  `is_active` char(1) DEFAULT NULL,
  `enable_negmarks` char(1) DEFAULT NULL,
  `uploaded_on` datetime DEFAULT NULL,
  `uploaded_by` varchar(50) DEFAULT NULL,
  `deleted_on` datetime DEFAULT NULL,
  `deleted_by` varchar(50) DEFAULT NULL,
  `imported_on` datetime DEFAULT NULL,
  `imported_by` varchar(50) DEFAULT NULL,
  `exam_date` datetime DEFAULT NULL,
  `source_key` varchar(20) DEFAULT 'NULL',
  `edit_mode` enum('Y','N') DEFAULT NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feed_log`
--

DROP TABLE IF EXISTS `feed_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feed_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `center_code` varchar(10) DEFAULT NULL,
  `server_no` varchar(2) DEFAULT NULL,
  `feed_no` smallint(11) DEFAULT NULL,
  `inserted_time` datetime DEFAULT NULL,
  `filename` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `centers` (`center_code`,`server_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gracetime`
--

DROP TABLE IF EXISTS `gracetime`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gracetime` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregrace` int(11) DEFAULT NULL,
  `postgrace` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gracetime`
--

INSERT INTO `gracetime` (`id`, `pregrace`, `postgrace`) VALUES
(NULL, 90, 30);


--
-- Table structure for table `iib_admin`
--

DROP TABLE IF EXISTS `iib_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_admin` (
  `table_row_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` char(20) NOT NULL DEFAULT '0',
  `admin_pass` varchar(50) DEFAULT NULL,
  `admin_type` int(1) DEFAULT '0',
  PRIMARY KEY (`table_row_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_appln_issues`
--

DROP TABLE IF EXISTS `iib_appln_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_appln_issues` (
  `reason` char(40) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `iib_appln_issues` (`reason`) VALUES
('Login Problem'),
('Network Connectivity Problem'),
('Technical Problem'),
('Others');

--
-- Table structure for table `iib_appln_issues_logs`
--

DROP TABLE IF EXISTS `iib_appln_issues_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_appln_issues_logs` (
  `row_id` int(11) NOT NULL AUTO_INCREMENT,
  `membership_no` varchar(20) DEFAULT NULL,
  `centre_code` varchar(20) DEFAULT NULL,
  `reason` varchar(40) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `exam_time` time DEFAULT NULL,
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`row_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_backup`
--

DROP TABLE IF EXISTS `iib_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_backup` (
  `subject_code` varchar(20) DEFAULT NULL,
  `membership_no` varchar(20) DEFAULT NULL,
  `medium_code` char(1) DEFAULT NULL,
  `question_paper_no` int(11) DEFAULT NULL,
  `question_id` int(11) DEFAULT NULL,
  `answer` char(1) DEFAULT NULL,
  `updatedtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `correct_answer` char(1) DEFAULT NULL,
  KEY `idx1` (`membership_no`),
  KEY `idx2` (`question_paper_no`),
  KEY `subject_code_idx` (`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_backup_log`
--

DROP TABLE IF EXISTS `iib_backup_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_backup_log` (
  `subject_code` varchar(20) DEFAULT NULL,
  `membership_no` varchar(20) DEFAULT NULL,
  `question_paper_no` int(11) DEFAULT NULL,
  `log_mesg` text,
  `updatedtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate`
--

DROP TABLE IF EXISTS `iib_candidate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate` (
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `exam_centre_code` int(11) DEFAULT NULL,
  `mem_type` char(2) DEFAULT NULL,
  `gender` char(1) DEFAULT NULL,
  `password` varchar(50) NOT NULL DEFAULT '',
  `address1` varchar(100) DEFAULT NULL,
  `address2` varchar(100) DEFAULT NULL,
  `address3` varchar(100) NOT NULL DEFAULT '',
  `address4` varchar(100) NOT NULL DEFAULT '',
  `address5` varchar(100) DEFAULT NULL,
  `address6` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zone_code` varchar(5) DEFAULT NULL,
  `state_code` varchar(5) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `pin_code` varchar(20) DEFAULT NULL,
  `institution_code` varchar(20) DEFAULT NULL,
  `institution_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`membership_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate_iway`
--

DROP TABLE IF EXISTS `iib_candidate_iway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate_iway` (
  `membership_no` char(20) NOT NULL DEFAULT '',
  `centre_code` char(20) NOT NULL DEFAULT '',
  `exam_code` char(20) NOT NULL DEFAULT '',
  `subject_code` char(20) NOT NULL DEFAULT '',
  `zone_code` time NOT NULL DEFAULT '00:00:00',
  `state_code` char(5) DEFAULT NULL,
  `exam_date` date DEFAULT '0000-00-00',
  `exam_time` time DEFAULT '00:00:00',
  `qp_assigned` enum('Y','N') DEFAULT 'N',
  `qp_generated` enum('Y','N') DEFAULT 'N',
  PRIMARY KEY (`membership_no`,`exam_code`,`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate_scores`
--

DROP TABLE IF EXISTS `iib_candidate_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate_scores` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `membership_no` varchar(20) NOT NULL,
  `exam_code` int(11) NOT NULL,
  `subject_code` int(11) NOT NULL,
  `score` varchar(250) DEFAULT NULL,
  `exam_date` datetime DEFAULT NULL,
  `time_taken` int(11) DEFAULT NULL,
  `result` varchar(250) DEFAULT NULL,
  `auto_submit` enum('Y','N', 'TA') DEFAULT 'N',
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `membership_no` (`membership_no`,`exam_code`,`subject_code`),
  KEY `id_index` (`membership_no`,`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate_scores_log`
--

DROP TABLE IF EXISTS `iib_candidate_scores_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate_scores_log` (
  `membership_no` char(20) NOT NULL DEFAULT '',
  `exam_code` char(20) NOT NULL DEFAULT '',
  `subject_code` char(20) NOT NULL DEFAULT '',
  `score` varchar(250) DEFAULT NULL,
  `exam_date` datetime DEFAULT NULL,
  `time_taken` int(11) DEFAULT NULL,
  `result` varchar(250) DEFAULT NULL,
  `updatedtime` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate_test`
--

DROP TABLE IF EXISTS `iib_candidate_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate_test` (
  `test_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `membership_no` char(20) NOT NULL DEFAULT '',
  `exam_code` char(20) NOT NULL DEFAULT '',
  `subject_code` char(20) NOT NULL DEFAULT '',
  `question_paper_no` int(11) NOT NULL DEFAULT '0',
  `ta_override` enum('Y','N') NOT NULL DEFAULT 'N',
  `login_override` enum('Y','N') NOT NULL DEFAULT 'N',
  `test_status` char(2) NOT NULL DEFAULT '',
  `start_time` datetime DEFAULT NULL,
  `last_updated_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_time` int(11) DEFAULT NULL,
  `time_taken` int(11) DEFAULT NULL,
  `time_left` int(11) DEFAULT NULL,
  `current_session` enum('Y','N') DEFAULT 'Y',
  `browser_status` enum('opened','closed') DEFAULT 'opened',
  `time_extended` int(11) NOT NULL DEFAULT '0',
  `timeloss` int(11) DEFAULT '0',
  `host_ip` char(100) DEFAULT NULL,
  `browser_details` tinytext,
  `serverno` char(1) NOT NULL,
  `clienttime` int(11) NOT NULL,
  PRIMARY KEY (`test_id`),
  KEY `candidate_test` (`membership_no`,`exam_code`,`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate_test_log`
--

DROP TABLE IF EXISTS `iib_candidate_test_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate_test_log` (
  `test_id` int(11) DEFAULT NULL,
  `membership_no` char(20) NOT NULL DEFAULT '',
  `exam_code` char(20) NOT NULL DEFAULT '',
  `subject_code` char(20) NOT NULL DEFAULT '',
  `question_paper_no` int(11) NOT NULL DEFAULT '0',
  `ta_override` enum('Y','N') NOT NULL DEFAULT 'N',
  `login_override` enum('Y','N') NOT NULL DEFAULT 'N',
  `test_status` char(2) NOT NULL DEFAULT '',
  `start_time` datetime DEFAULT NULL,
  `last_updated_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_time` int(11) DEFAULT NULL,
  `time_taken` int(11) DEFAULT NULL,
  `time_left` int(11) DEFAULT NULL,
  `current_session` enum('Y','N') NOT NULL DEFAULT 'Y',
  `updatedtime` datetime DEFAULT NULL,
  `time_extended` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate_tracking`
--

DROP TABLE IF EXISTS `iib_candidate_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate_tracking` (
  `ta_login` char(20) DEFAULT NULL,
  `membership_no` char(20) DEFAULT NULL,
  `cafe_id` char(20) DEFAULT NULL,
  `host_ip` char(100) DEFAULT NULL,
  `session_id` char(100) DEFAULT NULL,
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `browser_details` tinytext,
  `exam_code` int(11) DEFAULT NULL,
  `subject_code` int(11) DEFAULT NULL,
  `user_status` tinyint(1) DEFAULT '1',
  KEY `mem_no` (`membership_no`),
  KEY `idx1` (`membership_no`,`exam_code`,`subject_code`),
  KEY `idx2` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_candidate_tracking`
--

DROP TABLE IF EXISTS `iib_candidate_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_candidate_tracking` (
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`membership_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_case_master`
--

DROP TABLE IF EXISTS `iib_case_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_case_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` int(11) NOT NULL DEFAULT '0',
  `case_text` text,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `case_marks` decimal(7,2) NOT NULL DEFAULT '0.00',
  `is_active` enum('0','1') DEFAULT '1',
  `sub_section_code` int(11) DEFAULT NULL,
  `difficulty` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `case_id` (`case_id`,`exam_code`,`subject_code`,`section_code`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_case_master_audittrail`
--

DROP TABLE IF EXISTS `iib_case_master_audittrail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_case_master_audittrail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` int(11) NOT NULL DEFAULT '0',
  `case_text` text,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `case_marks` decimal(7,2) NOT NULL DEFAULT '0.00',
  `is_active` enum('0','1') DEFAULT '1',
  `sub_section_code` int(11) DEFAULT NULL,
  `difficulty` smallint(6) DEFAULT NULL,
  `status` enum('A','C','R','N','E') DEFAULT 'N',
  `reason` enum('E','R') DEFAULT 'E',
  `edited_by` varchar(50) DEFAULT NULL,
  `edited_date` datetime DEFAULT NULL,
  `reject_reason` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `case_id` (`case_id`,`exam_code`,`subject_code`,`section_code`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_case_master_hindi`
--

DROP TABLE IF EXISTS `iib_case_master_hindi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_case_master_hindi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` int(11) NOT NULL DEFAULT '0',
  `case_text` text,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `case_marks` decimal(7,2) NOT NULL DEFAULT '0.00',
  `is_active` enum('0','1') DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `case_id` (`case_id`,`exam_code`,`subject_code`,`section_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `iib_case_master_unicode`
--

DROP TABLE IF EXISTS `iib_case_master_unicode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_case_master_unicode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` int(11) NOT NULL DEFAULT '0',
  `case_text` text,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `lang_code` varchar(5) NOT NULL,
  `sub_section_code` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `case_id` (`case_id`,`exam_code`,`subject_code`,`section_code`,`lang_code`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_centre_change_logs`
--

DROP TABLE IF EXISTS `iib_centre_change_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_centre_change_logs` (
  `row_id` int(11) NOT NULL AUTO_INCREMENT,
  `membership_no` varchar(20) DEFAULT NULL,
  `exam_code` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `exam_time` time DEFAULT NULL,
  `old_centre_code` varchar(20) DEFAULT NULL,
  `new_centre_code` varchar(20) DEFAULT NULL,
  `reason` varchar(40) DEFAULT NULL,
  `modified_on` datetime DEFAULT NULL,
  PRIMARY KEY (`row_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_change_reason`
--

DROP TABLE IF EXISTS `iib_change_reason`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_change_reason` (
  `reason` char(40) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `iib_change_reason` (`reason`) VALUES
('Hall Ticket Does not match'),
('Wrong centre'),
('iWay Problem'),
('Others'),
('Power failure'),
('Cafe closed'),
('Connectivity problem'),
('IIBF request'),
('Excess Candidate'),
('Technical Problem');

--
-- Table structure for table `iib_exam`
--

DROP TABLE IF EXISTS `iib_exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_exam` (
  `exam_code` int(11) NOT NULL AUTO_INCREMENT,
  `exam_name` varchar(250) DEFAULT NULL,
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `exam_description` varchar(255) DEFAULT NULL,
  `exam_type` int(11) DEFAULT '1',
  `subj_selection` enum('Y','N') DEFAULT 'N',
  PRIMARY KEY (`exam_code`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_exam_candidate`
--

DROP TABLE IF EXISTS `iib_exam_candidate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_exam_candidate` (
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `medium_code` varchar(20) DEFAULT NULL,
  `institution_code` varchar(20) DEFAULT NULL,
  `alloted` char(1) NOT NULL DEFAULT 'N',
  KEY `id_index` (`membership_no`,`exam_code`,`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_exam_centres`
--

DROP TABLE IF EXISTS `iib_exam_centres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_exam_centres` (
  `exam_centre_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_centre_code` varchar(20) NOT NULL DEFAULT '',
  `exam_centre_name` varchar(255) DEFAULT NULL,
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`exam_centre_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_exam_schedule`
--

DROP TABLE IF EXISTS `iib_exam_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_exam_schedule` (
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `exam_date` date DEFAULT NULL,
  `online` enum('Y','N') NOT NULL DEFAULT 'Y'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_exam_slots`
--

DROP TABLE IF EXISTS `iib_exam_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_exam_slots` (
  `slot_no` int(11) NOT NULL AUTO_INCREMENT,
  `slot_time` time DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  PRIMARY KEY (`slot_no`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_exam_subjects`
--

DROP TABLE IF EXISTS `iib_exam_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_exam_subjects` (
  `subject_code` int(11) NOT NULL AUTO_INCREMENT,
  `subject_name` varchar(250) DEFAULT NULL,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `total_marks` int(5) unsigned NOT NULL DEFAULT '0',
  `pass_mark` int(5) unsigned NOT NULL DEFAULT '0',
  `grace_mark` int(5) unsigned NOT NULL DEFAULT '0',
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `subject_duration` int(11) DEFAULT NULL,
  `duration_prevent` int(11) DEFAULT NULL,
  `en_desc_ques` enum('Y','N') DEFAULT 'N',
  `display_score` enum('Y','N') DEFAULT 'N',
  `display_result` enum('Y','N') DEFAULT 'N',
  `display_response` enum('Y','N') DEFAULT 'N',
  `roundoff_score` enum('Y','N') DEFAULT 'N',
  `display_sec_nav` enum('Y','N') DEFAULT 'N',
  `display_sec_timer` enum('Y','N') DEFAULT 'N',
  `pass_msg` text,
  `fail_msg` text,
  `grace_pre` int(11) DEFAULT NULL,
  `grace_post` int(11) DEFAULT NULL,
  `answer_shuffling` enum('Y','N') DEFAULT 'N',
  `question_display` enum('O','A','M') DEFAULT 'O',
  `updatedtime` datetime DEFAULT NULL,
  `result_type` char(2) DEFAULT 'PA',
  `option_flag` enum('Y','N') DEFAULT NULL,
  `option_id` int(11) DEFAULT NULL,
  `max_no_of_questions` int(11) DEFAULT NULL,
  `break_duration` int(11) DEFAULT NULL,
  `display_print` enum('Y','N') DEFAULT 'Y',
  `display_mark` enum('Y','N') DEFAULT 'Y',
  `languages` varchar(255) DEFAULT NULL,
  `display_sectionname` enum('Y','N') DEFAULT 'Y',
  `display_casequestion` enum('A','S') DEFAULT 'A',
  `display_noofquestions` smallint(5) unsigned NOT NULL DEFAULT '1',
  `answer_saving_type` enum('T','Q') DEFAULT 'Q',
  `answer_saving_interval` int(3) unsigned NOT NULL DEFAULT '1',
  `display_donotwanttoanswer` enum('Y','N') DEFAULT 'N',
  `timelog_enable` enum('Y','N') DEFAULT 'N',
  `enable_description` enum('Y','N') DEFAULT 'N',
  PRIMARY KEY (`subject_code`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_feedback`
--

DROP TABLE IF EXISTS `iib_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_feedback` (
  `membership_no` varchar(20) DEFAULT NULL,
  `exam_code` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `login_process` enum('Y','N') DEFAULT 'N',
  `system_work` enum('Y','N') DEFAULT 'N',
  `tech_prob` enum('Y','N') DEFAULT 'N',
  `q_rating` enum('easy','difficult','relevant','not relevant','cant say') DEFAULT 'cant say',
  `adeq_time` enum('Y','N') DEFAULT 'N',
  `navigate_issue` enum('Y','N') DEFAULT 'N',
  `rating` enum('excellent','very good','good','average','poor') DEFAULT 'poor',
  `feedback_text` text,
  `diplay_questions` text,
  `problem_questions` text,
  `question_asked_twice` text,
  `answer_not_relevant` text,
  `question_not_display` text,
  `answer_not_display` text,
  `display_image_issue` text,
  `Display_issue_notdisprop` text,
  `Junk_Char_observed` text
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_fm_log`
--

DROP TABLE IF EXISTS `iib_fm_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_fm_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file` char(100) DEFAULT NULL,
  `updatedtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_format`
--

DROP TABLE IF EXISTS `iib_format`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_format` (
  `membership_no` varchar(20) DEFAULT NULL,
  `ta_login` varchar(20) DEFAULT NULL,
  `centre_code` varchar(20) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `exam_time` time DEFAULT NULL,
  `reasons` text,
  `others` varchar(255) DEFAULT NULL,
  `format_type` char(1) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_franchisee`
--

DROP TABLE IF EXISTS `iib_franchisee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_franchisee` (
  `row_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `exam_centre_code` int(11) DEFAULT NULL,
  PRIMARY KEY (`row_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_franchisee_iway`
--

DROP TABLE IF EXISTS `iib_franchisee_iway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_franchisee_iway` (
  `fm_id` int(11) NOT NULL DEFAULT '0',
  `centre_code` char(20) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_franchisee_map`
--

DROP TABLE IF EXISTS `iib_franchisee_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_franchisee_map` (
  `FranchiseeId` int(11) NOT NULL DEFAULT '0',
  `centre_code` varchar(20) DEFAULT NULL,
  `no_of_seats` int(11) DEFAULT NULL,
  `city` varchar(30) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_incomplete_scores`
--

DROP TABLE IF EXISTS `iib_incomplete_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_incomplete_scores` (
  `membership_no` varchar(20) DEFAULT NULL,
  `exam_code` int(11) DEFAULT NULL,
  `subject_code` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `result` char(1) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_ing_feedback`
--

DROP TABLE IF EXISTS `iib_ing_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_ing_feedback` (
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `question1` char(1) DEFAULT NULL,
  `question2` char(1) DEFAULT NULL,
  `question3` char(5) DEFAULT NULL,
  `question4` char(1) DEFAULT NULL,
  `question5` char(1) DEFAULT NULL,
  `question6` char(1) DEFAULT NULL,
  `question7` char(1) DEFAULT NULL,
  `question8` text,
  `updated` datetime DEFAULT NULL,
  PRIMARY KEY (`membership_no`,`exam_code`,`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_instructionslate`
--

DROP TABLE IF EXISTS `iib_instructionslate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_instructionslate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `medium_code` varchar(20) DEFAULT 'E',
  `instruction_text` text,
  `is_active` char(1) DEFAULT 'Y',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_iway_details`
--

DROP TABLE IF EXISTS `iib_iway_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_iway_details` (
  `centre_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `centre_code` varchar(20) NOT NULL DEFAULT '',
  `iway_name` varchar(100) NOT NULL DEFAULT '',
  `no_of_seats` int(11) NOT NULL DEFAULT '0',
  `status` enum('N','A','D') DEFAULT NULL,
  `iway_address1` varchar(255) DEFAULT NULL,
  `iway_address2` varchar(255) DEFAULT NULL,
  `iway_city` varchar(100) DEFAULT NULL,
  `iway_state` varchar(100) DEFAULT NULL,
  `iway_pin_code` varchar(20) DEFAULT NULL,
  `exam_centre_code` int(11) unsigned NOT NULL DEFAULT '0',
  `iway_zone` varchar(20) NOT NULL DEFAULT '',
  `actual_seats` int(11) DEFAULT '0',
  `logomaster_ref` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`centre_id`),
  KEY `iway_centre_code` (`centre_code`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_iway_vacancy`
--

DROP TABLE IF EXISTS `iib_iway_vacancy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_iway_vacancy` (
  `centre_code` char(20) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `exam_time` time DEFAULT NULL,
  `no_of_seats` int(11) NOT NULL DEFAULT '0',
  `filled` int(11) NOT NULL DEFAULT '0',
  `remaining` int(11) NOT NULL DEFAULT '0',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `centre_date_time` (`centre_code`,`exam_date`,`exam_time`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_iway_vacancy_log`
--

DROP TABLE IF EXISTS `iib_iway_vacancy_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_iway_vacancy_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `centre_code` char(20) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `exam_time` time DEFAULT NULL,
  `old_remaining` int(11) NOT NULL DEFAULT '0',
  `seats_added` int(11) NOT NULL DEFAULT '0',
  `updatedtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_languages`
--

DROP TABLE IF EXISTS `iib_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lang_code` varchar(5) NOT NULL,
  `lang_name` varchar(50) NOT NULL,
  `updated_time` datetime DEFAULT NULL,
  `is_active` enum('Y','N') DEFAULT 'N',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uni_idx_lang` (`lang_code`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `iib_languages` (`id`, `lang_code`, `lang_name`, `updated_time`, `is_active`) VALUES
(1, 'EN', 'English/Hindi', '2010-01-27 15:40:18', 'Y'),
(2, 'HI', 'Hindi with Unicode', '2010-01-27 15:40:43', 'Y'),
(3, 'HIDV', 'Hindi with DVBW-TTYogeshEN font', '2010-01-27 15:40:52', 'Y'),
(4, 'HISH', 'Hindi with Shree-Dev-0714EW font', '2010-01-27 15:41:00', 'Y'),
(5, 'HISU', 'Hindi with Suchi-Dev-0714W font', '2010-01-27 15:41:08', 'Y'),
(6, 'MR', 'Marathi', '2010-01-27 15:41:15', 'Y'),
(7, 'ML', 'Malayalam', '2010-01-27 15:41:25', 'Y'),
(8, 'TA', 'Tamil', '2010-01-27 15:41:31', 'Y'),
(9, 'TE', 'Telugu', '2010-01-27 15:41:38', 'Y'),
(10, 'KN', 'Kannada', '2010-01-27 15:41:45', 'Y'),
(11, 'OR', 'Oriya', '0000-00-00 00:00:00', 'Y'),
(12, 'BN', 'Bengali', '2010-01-27 15:42:09', 'Y'),
(13, 'GU', 'Gujarati', '2010-01-27 15:42:10', 'Y');

--
-- Table structure for table `iib_logo_master`
--

DROP TABLE IF EXISTS `iib_logo_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_logo_master` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `img_path` varchar(255) NOT NULL DEFAULT '',
  `alt_text` varchar(255) NOT NULL DEFAULT '',
  `active` enum('Y','N') NOT NULL DEFAULT 'N',
  `added_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_pass`
--

DROP TABLE IF EXISTS `iib_pass`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_pass` (
  `password` varchar(30) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_qp_center_codes`
--

DROP TABLE IF EXISTS `iib_qp_center_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_qp_center_codes` (
  `center_code` varchar(20) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `status` enum('P','C') DEFAULT 'P'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_qp_weightage`
--

DROP TABLE IF EXISTS `iib_qp_weightage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_qp_weightage` (
  `question_paper_no` int(11) NOT NULL DEFAULT '0',
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `sub_section_code` int(11) DEFAULT NULL,
  `difficulty` smallint(6) DEFAULT NULL,
  `marks` int(5) NOT NULL DEFAULT '0',
  `no_of_questions` int(11) DEFAULT NULL,
  `case_id` int(11) DEFAULT NULL,
  KEY `question_paper_no_idx` (`question_paper_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_question_paper`
--

DROP TABLE IF EXISTS `iib_question_paper`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_question_paper` (
  `question_paper_no` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `total_marks` int(11) NOT NULL DEFAULT '0',
  `sample` enum('Y','N') DEFAULT NULL,
  `enabled` enum('Y','N') DEFAULT NULL,
  `online` enum('Y','N') DEFAULT NULL,
  `assigned` enum('Y','N') DEFAULT NULL,
  `complete` enum('Y','N') NOT NULL DEFAULT 'N',
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `medium_code` enum('H','E') NOT NULL DEFAULT 'E',
  `html_qp_generated` enum('Y','N') DEFAULT 'N',
  PRIMARY KEY (`question_paper_no`),
  KEY `membership_no_idx` (`membership_no`),
  KEY `idx_upqp` (`exam_code`,`subject_code`,`assigned`,`online`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_question_paper_details`
--

DROP TABLE IF EXISTS `iib_question_paper_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_question_paper_details` (
  `question_paper_no` int(11) NOT NULL DEFAULT '0',
  `subject_code` varchar(20) DEFAULT NULL,
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_id` int(11) NOT NULL DEFAULT '0',
  `case_id` int(11) DEFAULT NULL,
  `answer` varchar(250) DEFAULT '',
  `answer_order` varchar(20) NOT NULL DEFAULT '',
  `display_order` int(10) unsigned NOT NULL DEFAULT '0',
  `updated_time` datetime DEFAULT NULL,
  KEY `paper_question` (`question_paper_no`,`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_question_paper_details_log`
--

DROP TABLE IF EXISTS `iib_question_paper_details_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_question_paper_details_log` (
  `question_paper_no` int(11) NOT NULL DEFAULT '0',
  `subject_code` varchar(20) DEFAULT NULL,
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_id` int(11) NOT NULL DEFAULT '0',
  `answer` char(1) NOT NULL DEFAULT '',
  `answer_order` varchar(20) NOT NULL DEFAULT '',
  `display_order` int(10) unsigned NOT NULL DEFAULT '0',
  `updatedtime` datetime DEFAULT NULL,
  KEY `paper_question` (`question_id`,`question_paper_no`),
  KEY `subjectcode_idx` (`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_question_paper_generation`
--

DROP TABLE IF EXISTS `iib_question_paper_generation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_question_paper_generation` (
  `transaction_no` int(11) NOT NULL AUTO_INCREMENT,
  `attributes_list` varchar(255) DEFAULT NULL,
  `transaction_time` datetime DEFAULT NULL,
  PRIMARY KEY (`transaction_no`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_reject_questions`
--

DROP TABLE IF EXISTS `iib_reject_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_reject_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) DEFAULT NULL,
  `reject_reason` varchar(200) DEFAULT NULL,
  `rejected_by` varchar(50) DEFAULT NULL,
  `reject_date` datetime DEFAULT NULL,
  `format_type` enum('Q','CD') DEFAULT NULL,
  `status` enum('C','O') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_response`
--

DROP TABLE IF EXISTS `iib_response`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_response` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_paper_no` int(11) NOT NULL DEFAULT '0',
  `question_id` int(11) NOT NULL DEFAULT '0',
  `answer` varchar(250) DEFAULT '',
  `display_order` int(10) unsigned NOT NULL DEFAULT '0',
  `tag` enum('Y','N') NOT NULL DEFAULT 'N',
  `host_ip` varchar(100) NOT NULL DEFAULT '0',
  `updatedtime` datetime DEFAULT NULL,
  `clienttime` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `test_idx` (`question_paper_no`,`question_id`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_score_calculation`
--

DROP TABLE IF EXISTS `iib_score_calculation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_score_calculation` (
  `membership_no` char(20) DEFAULT '',
  `subject_code` char(20) DEFAULT NULL,
  `score_calc` decimal(7,2) DEFAULT NULL,
  `question_paper_no` int(11) DEFAULT NULL,
  KEY `qp_no` (`question_paper_no`),
  KEY `mem_no` (`membership_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_section_questions`
--

DROP TABLE IF EXISTS `iib_section_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_section_questions` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_text` text NOT NULL,
  `option_1` text NOT NULL,
  `option_2` text NOT NULL,
  `option_3` text NOT NULL,
  `option_4` text NOT NULL,
  `option_5` text NOT NULL,
  `correct_answer` varchar(10) NOT NULL,
  `marks` decimal(7,2) DEFAULT '0.00',
  `negative_marks` decimal(7,2) DEFAULT NULL,
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `question_code` varchar(50) DEFAULT NULL,
  `case_id` int(11) DEFAULT '0',
  `case_type` enum('Y','N') DEFAULT NULL,
  `question_type` char(2) NOT NULL,
  `difficulty` smallint(6) DEFAULT NULL,
  `sub_section_code` int(11) DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=MyISAM AUTO_INCREMENT=204 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_section_questions_audittrail`
--

DROP TABLE IF EXISTS `iib_section_questions_audittrail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_section_questions_audittrail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_text` text NOT NULL,
  `option_1` text NOT NULL,
  `option_2` text NOT NULL,
  `option_3` text NOT NULL,
  `option_4` text NOT NULL,
  `option_5` text NOT NULL,
  `correct_answer` varchar(10) NOT NULL,
  `marks` decimal(7,2) DEFAULT '0.00',
  `negative_marks` decimal(7,2) DEFAULT NULL,
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `question_code` varchar(50) DEFAULT NULL,
  `case_id` int(11) DEFAULT NULL,
  `case_type` enum('Y','N') DEFAULT NULL,
  `question_type` char(2) NOT NULL,
  `difficulty` smallint(6) DEFAULT NULL,
  `status` enum('A','C','R','N','E') DEFAULT 'N',
  `reason` enum('E','R') DEFAULT 'E',
  `edited_by` varchar(50) DEFAULT NULL,
  `edited_date` datetime DEFAULT NULL,
  `sub_section_code` int(11) DEFAULT NULL,
  `reject_reason` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_section_questions_blob`
--

DROP TABLE IF EXISTS `iib_section_questions_blob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_section_questions_blob` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_text` blob,
  `option_1` blob,
  `option_2` blob,
  `option_3` blob,
  `option_4` blob,
  `option_5` blob,
  `correct_answer` char(1) NOT NULL DEFAULT '',
  `marks` decimal(7,2) DEFAULT '0.00',
  `negative_marks` decimal(7,3) DEFAULT '0.000',
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `question_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_section_questions_hindi`
--

DROP TABLE IF EXISTS `iib_section_questions_hindi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_section_questions_hindi` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_text` text,
  `option_1` text,
  `option_2` text,
  `option_3` text,
  `option_4` text,
  `option_5` text,
  `correct_answer` char(1) NOT NULL DEFAULT '',
  `marks` decimal(7,2) DEFAULT '0.00',
  `negative_marks` decimal(7,3) DEFAULT '0.000',
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `question_code` varchar(50) DEFAULT NULL,
  `case_id` int(11) DEFAULT NULL,
  `case_type` enum('Y','N') DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_section_questions_hindi_blob`
--

DROP TABLE IF EXISTS `iib_section_questions_hindi_blob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_section_questions_hindi_blob` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_text` blob,
  `option_1` blob,
  `option_2` blob,
  `option_3` blob,
  `option_4` blob,
  `option_5` blob,
  `correct_answer` char(1) NOT NULL DEFAULT '',
  `marks` decimal(7,2) DEFAULT '0.00',
  `negative_marks` decimal(7,3) DEFAULT '0.000',
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `question_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `iib_section_questions_unicode`
--

DROP TABLE IF EXISTS `iib_section_questions_unicode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_section_questions_unicode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_text` text NOT NULL,
  `option_1` text NOT NULL,
  `option_2` text NOT NULL,
  `option_3` text NOT NULL,
  `option_4` text NOT NULL,
  `option_5` text NOT NULL,
  `lang_code` varchar(5) NOT NULL,
  `sub_section_code` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lang_qns` (`exam_code`,`subject_code`,`lang_code`,`question_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_session`
--

DROP TABLE IF EXISTS `iib_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_session` (
  `sid` char(100) NOT NULL DEFAULT '',
  `value` text,
  `expire_time` int(14) unsigned DEFAULT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_subject_change_log`
--

DROP TABLE IF EXISTS `iib_subject_change_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_subject_change_log` (
  `rowid` int(11) NOT NULL AUTO_INCREMENT,
  `membership_no` varchar(20) DEFAULT NULL,
  `old_subject` int(11) DEFAULT NULL,
  `new_subject` int(11) DEFAULT NULL,
  `changed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rowid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_subject_sections`
--

DROP TABLE IF EXISTS `iib_subject_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_subject_sections` (
  `section_code` int(11) NOT NULL DEFAULT '0',
  `section_name` varchar(50) DEFAULT NULL,
  `subject_code` int(11) NOT NULL DEFAULT '0',
  `section_type` enum('G','C','D') DEFAULT 'G',
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  `section_duration` int(11) DEFAULT '0',
  PRIMARY KEY (`section_code`,`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_subject_subsections`
--

DROP TABLE IF EXISTS `iib_subject_subsections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_subject_subsections` (
  `sub_section_code` int(11) NOT NULL DEFAULT '0',
  `sub_section_name` varchar(50) DEFAULT NULL,
  `subject_code` int(11) NOT NULL DEFAULT '0',
  `section_code` int(11) NOT NULL DEFAULT '0',
  `online` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`sub_section_code`,`section_code`,`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_ta_details`
--

DROP TABLE IF EXISTS `iib_ta_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_ta_details` (
  `ta_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ta_login` char(20) NOT NULL DEFAULT '',
  `ta_name` char(50) NOT NULL DEFAULT '',
  `ta_password` char(50) NOT NULL DEFAULT '',
  `cafe_id` char(20) DEFAULT NULL,
  `centre_code` char(20) NOT NULL DEFAULT '',
  `is_active` enum('0','1') DEFAULT '1',
  `start_ip` bigint(20) NOT NULL DEFAULT '0',
  `end_ip` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ta_id`),
  UNIQUE KEY `ind_talogin` (`ta_login`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_ta_iway`
--

DROP TABLE IF EXISTS `iib_ta_iway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_ta_iway` (
  `ta_login` varchar(20) NOT NULL DEFAULT '',
  `centre_code` varchar(20) NOT NULL DEFAULT '',
  `exam_date` date NOT NULL DEFAULT '0000-00-00',
  `exam_time` time NOT NULL DEFAULT '00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_ta_password`
--

DROP TABLE IF EXISTS `iib_ta_password`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_ta_password` (
  `ta_login` varchar(20) NOT NULL DEFAULT '',
  `login_password` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ta_login`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_ta_password_decrypt`
--

DROP TABLE IF EXISTS `iib_ta_password_decrypt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_ta_password_decrypt` (
  `ta_login` varchar(20) NOT NULL,
  `login_password` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ta_login`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_ta_password`
--

DROP TABLE IF EXISTS `iib_ta_password`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_ta_password` (
  `ta_login` varchar(20) DEFAULT NULL,
  `login_password` varchar(20) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_ta_tracking`
--

DROP TABLE IF EXISTS `iib_ta_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_ta_tracking` (
  `ta_login` char(20) DEFAULT NULL,
  `cafe_id` char(20) DEFAULT NULL,
  `host_ip` char(100) DEFAULT NULL,
  `session_id` char(100) DEFAULT NULL,
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib`
--

DROP TABLE IF EXISTS `iib`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib` (
  `centre_code` varchar(20) DEFAULT NULL,
  `no_of_seats` int(11) DEFAULT NULL,
  `fm_name` varchar(75) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_time_change_logs`
--

DROP TABLE IF EXISTS `iib_time_change_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_time_change_logs` (
  `row_id` int(11) NOT NULL AUTO_INCREMENT,
  `membership_no` varchar(20) DEFAULT NULL,
  `exam_code` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `centre_code` varchar(20) DEFAULT NULL,
  `old_exam_time` varchar(20) DEFAULT NULL,
  `new_exam_time` varchar(20) DEFAULT NULL,
  `reason` varchar(40) DEFAULT NULL,
  `modified_on` datetime DEFAULT NULL,
  PRIMARY KEY (`row_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `iib_time_change_reason`
--

DROP TABLE IF EXISTS `iib_time_change_reason`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_time_change_reason` (
  `reason` char(40) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `iib_time_change_reason` (`reason`) VALUES
('Candidate Late'),
('Wrong centre'),
('iWay Problem'),
('PC not available'),
('Power failure'),
('Connectivity problem'),
('Excess Candidate'),
('Technical Problem'),
('Others');

--
-- Table structure for table `themes`
--

DROP TABLE IF EXISTS `themes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `themes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(100) DEFAULT NULL,
  `color_code` varchar(7) DEFAULT NULL,
  `path` varchar(250) DEFAULT NULL,
  `is_active` varchar(3) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timelog`
--

DROP TABLE IF EXISTS `timelog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timelog` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `membership_no` varchar(20) NOT NULL,
  `test_id` bigint(20) NOT NULL,
  `questionpaperno` int(11) NOT NULL,
  `servertime` datetime NOT NULL,
  `clienttime` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `member_rough_sheet`
--
DROP TABLE IF EXISTS `member_rough_sheet`;
CREATE TABLE `member_rough_sheet` (
  `membership_no` varchar(250) NOT NULL DEFAULT '',
  `question_paper_no` int(11) NOT NULL,
  `subject_code` varchar(25) DEFAULT NULL,
  `exam_date` date NOT NULL DEFAULT '0000-00-00',
  `message` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`membership_no`,`question_paper_no`,`exam_date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;
-- Dump completed on 2017-11-23 16:30:07

--
-- Table structure for table `xml_feed`
--
DROP TABLE IF EXISTS `xml_feed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `xml_feed` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query` text NOT NULL,
  `status` enum('Y','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Table structure for table `qp_download`
--
CREATE TABLE `qp_download` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `centre_code` varchar(20) DEFAULT NULL,
  `serverno` varchar(2) DEFAULT NULL,
  `download_sec` varchar(150) DEFAULT NULL,
  `download_status` varchar(2) DEFAULT NULL,
  `download_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Table structure for table `iib_closure_report`
--
CREATE TABLE `iib_closure_report` (
  `exam_date` date DEFAULT NULL,
  `centre_code` varchar(8) DEFAULT NULL,
  `exam_code` varchar(255) DEFAULT NULL,
  `feed_status` varchar(2) DEFAULT '0',
  `db_dump_status` varchar(2) DEFAULT '0',
  `ta_feedback` text,
  `subject_code` varchar(255) DEFAULT NULL,
  `serverno` varchar(2),
  `total_attended` int(11) DEFAULT NULL,
  `feed_count` int(11) DEFAULT NULL,
  `centre_name` varchar(100) DEFAULT NULL,
  `lab_name` varchar(100) DEFAULT NULL,
  `server_ip` varchar(20) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Table structure for table `exam_closure_summary`
--
CREATE TABLE `exam_closure_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_date` date DEFAULT NULL,
  `centre_code` varchar(20) DEFAULT NULL,
  `serverno` varchar(2) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `closure_action` varchar(32) DEFAULT NULL,
  `feedback` text,
  `closure_status` varchar(2) DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  `added_on` datetime DEFAULT NULL,
  `ip_address` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

--
-- Table structure for table `exam_day_end_report`
--
CREATE TABLE `exam_day_end_report` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `exam_name` varchar(100) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `centre_code` varchar(100) DEFAULT NULL,
  `server_no` varchar(1) DEFAULT NULL,
  `batch1_scheduled` int(4) DEFAULT NULL,
  `batch2_scheduled` int(4) DEFAULT NULL,
  `batch3_scheduled` int(4) DEFAULT NULL,
  `batch1_attended` int(4) DEFAULT NULL,
  `batch2_attended` int(4) DEFAULT NULL,
  `batch3_attended` int(4) DEFAULT NULL,
  `test_lab` int(4) DEFAULT NULL,
  `test_admin` int(4) DEFAULT NULL,
  `without_admit_card` int(4) DEFAULT NULL,
  `without_id_proof` int(4) DEFAULT NULL,
  `without_admit_card_id_proof` int(4) DEFAULT NULL,
  `test_reporting_late` int(4) DEFAULT NULL,
  `request_centre_change` int(4) DEFAULT NULL,
  `test_malpractice` int(4) DEFAULT NULL,
  `updated_ip` varchar(32) DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL, 
  `status` char(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `health_check` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `centre_code` varchar(20) DEFAULT NULL,
  `server` varchar(5) DEFAULT NULL,
  `serial_no` varchar(100) DEFAULT NULL,
  `server_time` varchar(200) DEFAULT NULL,
  `appl_time` varchar(200) DEFAULT NULL,
  `mysql_time` varchar(200) DEFAULT NULL,
  `qp_download` varchar(30) DEFAULT NULL,
  `qp_image` varchar(30) DEFAULT NULL,
  `qp_photo` varchar(30) DEFAULT NULL,
  `qp_sign` varchar(30) DEFAULT NULL,
  `batch_det` text,
  `feed_status` char(1) DEFAULT 'N',
  `feed_sync_cnt` varchar(30) DEFAULT NULL,
  `feed_gen_cnt` varchar(30) DEFAULT NULL,
  `closure` varchar(100) DEFAULT NULL,
  `dump_taken` char(1) DEFAULT 'N',
  `robo_copy` char(1) DEFAULT 'N',
  `robo_copy_files_cnt` varchar(30) DEFAULT NULL,
  `net_connectivity` char(1) DEFAULT 'N', 
  `ram_det` varchar(200) DEFAULT NULL,
  `processor_det` text,
  `system_ip_det` varchar(255) DEFAULT NULL,
  `disk_space_det` text,
  `os_det`varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `taserver_version` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `build_name` varchar(20) DEFAULT NULL,
  `build_version` decimal(3,1) DEFAULT NULL,
  `updated_date` datetime,
  `db_version` decimal(3,1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


CREATE TABLE `exam_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `variable_name` varchar(32) NOT NULL,
  `variable_value` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO exam_settings VALUES ('','secure_browser','Y'),('','login_limit','1'),('','max_users_allowed','150'),('','candidate_time_sync','600') ,('','time_log_enable','Y'),('','display_medium','Y'),('','display_medium_dropdown','Y'),('','virtual_keyboard','N'),('','TA_keyboard_enable','N'),('','feedback_enable','N'),('','next_section_intimation_time','300'),('','watermarking_qp','Y'),('','memcache_enable','Y'),('','clearfile_enable','Y');

CREATE TABLE `batchwise_closure_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_date` date DEFAULT NULL,
  `centre_code` varchar(20) DEFAULT NULL,
  `serverno` varchar(2) DEFAULT NULL,
  `closure_batch_time` time DEFAULT NULL,
  `closure_batch_file` varchar(255) DEFAULT NULL,  
  `closure_batch_status` varchar(2) DEFAULT NULL,
  `serial_no` varchar(32) DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  `added_on` datetime DEFAULT NULL,
  `ip_address` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `feed_filenames` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` text NOT NULL,
  `start_id` int(11) NOT NULL,
  `end_id` int(11) NOT NULL,
  `status` enum('Y','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `biometric_report_api` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `center_code` varchar(11) NOT NULL,
  `membership_no` varchar(30) NOT NULL DEFAULT '',
  `seat_no` varchar(10) NOT NULL DEFAULT '',
  `exam_date` date NOT NULL,
  `labname` text NOT NULL,
  `batch_time` varchar(10) NOT NULL DEFAULT '',
  `date_created` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `date_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `check_bio` (`membership_no`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `candidate_seat_management` (
  `biometric_id` int(10) NOT NULL AUTO_INCREMENT,
  `exam_centre_code` varchar(20) NOT NULL DEFAULT '',
  `exam_lab_code` text,
  `exam_seatno` varchar(10) NOT NULL DEFAULT '',
  `candidate_ipaddress` varchar(20) NOT NULL DEFAULT '127.0.0.1',
  `status` tinyint(2) NOT NULL DEFAULT '0',
  `date_created` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `date_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `exam_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`biometric_id`),
  KEY `check_bio` (`status`),
  KEY `getipAddress` (`exam_seatno`,`status`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `biometric_changelog` (
  `biolog_id` int(10) NOT NULL AUTO_INCREMENT,
  `bioreport_id` int(10) NOT NULL DEFAULT '0',
  `from_ip` varchar(20) NOT NULL DEFAULT '127.0.0.1',
  `to_ip` varchar(20) NOT NULL DEFAULT '127.0.0.1',
  `date_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `remote_serialno` varchar(20) NOT NULL DEFAULT '',
  `remote_ip` varchar(20) NOT NULL DEFAULT '127.0.0.1',
  PRIMARY KEY (`biolog_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

 CREATE TABLE `exam_skip_biometricvalidation` (
  `skip_id` int(10) NOT NULL AUTO_INCREMENT,
  `exam_date` date NOT NULL DEFAULT '0000-00-00',
  `exam_slot_time` time NOT NULL DEFAULT '00:00:00',
  `skip_mode` tinyint(4) NOT NULL DEFAULT '0',
  `membership_no` char(20) NOT NULL DEFAULT '',
  `dateaddedon` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `date_updated` datetime DEFAULT '0000-00-00 00:00:00',
  `skip_status` tinyint(4) NOT NULL DEFAULT '0',
  `admin_serialno` varchar(20) NOT NULL DEFAULT '',
  `admin_ipv4` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`skip_id`),
  KEY `status_check` (`skip_status`),
  KEY `exam_slot_check` (`skip_status`,`exam_slot_time`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `biometric_servers` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `server_ips` text CHARACTER SET utf8 NOT NULL,
  `date_created` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE batchwise_tracking (
`id` int(4) NOT NULL AUTO_INCREMENT DEFAULT NULL,
`exam_name` varchar(100) DEFAULT NULL,
`exam_date` date DEFAULT NULL,
`batch_time` time DEFAULT NULL,
`biometirc_user` int(11) DEFAULT NULL,
`biometirc_skip_user` int(11) DEFAULT NULL,
`sync_biometirc_exam_status` enum('I','P','C') DEFAULT 'P',
`sync_exam_status` enum('I','P','C') DEFAULT 'P',
`added_on` datetime DEFAULT NULL,
`updated_on` datetime DEFAULT NULL,
PRIMARY KEY (`id`)
)ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `iib_section_test`;
CREATE TABLE `iib_section_test` (
  `test_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `membership_no` char(20) NOT NULL DEFAULT '',
  `exam_code` char(20) NOT NULL DEFAULT '',
  `subject_code` char(20) NOT NULL DEFAULT '',
  `section_code` int(11) DEFAULT NULL,
  `question_paper_no` int(11) NOT NULL DEFAULT '0',
  `ta_override` enum('Y','N') NOT NULL DEFAULT 'N',
  `login_override` enum('Y','N') NOT NULL DEFAULT 'N',
  `test_status` char(2) NOT NULL DEFAULT '',
  `start_time` datetime DEFAULT NULL,
  `last_updated_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_time` int(11) DEFAULT NULL,
  `time_taken` int(11) DEFAULT NULL,
  `time_left` int(11) DEFAULT NULL,
  `current_session` enum('Y','N') DEFAULT 'Y',
  `browser_status` enum('opened','closed') DEFAULT 'opened',
  `time_extended` int(11) NOT NULL DEFAULT '0',
  `timeloss` int(11) DEFAULT '0',
  `host_ip` char(100) DEFAULT NULL,
  `browser_details` tinytext,
  `serverno` char(1) NOT NULL,
  `clienttime` int(11) NOT NULL,
  PRIMARY KEY (`test_id`),
  KEY `candidate_test` (`membership_no`,`exam_code`,`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `netboot_ip_mapping` (
  `netboot_id` int(10) NOT NULL AUTO_INCREMENT,  
  `local_ip` varchar(20) NOT NULL,
  `netboot_ip` varchar(20) NOT NULL,
  `mac_address` varchar(255) NOT NULL,
  `date_created` datetime NOT NULL,
  PRIMARY KEY (`netboot_id`),
  KEY `get_netboot` (`local_ip`),
  KEY `get_local_ip` (`netboot_ip`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

--
-- Table structure for table `iib_sq_unicode_details`
--

DROP TABLE IF EXISTS `iib_sq_unicode_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_sq_unicode_details` ( `id` int(11) NOT NULL AUTO_INCREMENT, `question_id` int(11) NOT NULL, `exam_code` varchar(20) NOT NULL DEFAULT '', `subject_code` varchar(20) NOT NULL DEFAULT '', `section_code` varchar(20) NOT NULL DEFAULT '', `question_text` text NOT NULL, `option_1` text NOT NULL, `option_2` text NOT NULL, `option_3` text NOT NULL, `option_4` text NOT NULL, `option_5` text NOT NULL, `lang_code` varchar(5) NOT NULL, `sub_section_code` int(11) DEFAULT NULL, PRIMARY KEY (`id`), KEY `idx_lang_qns` (`exam_code`,`subject_code`,`lang_code`,`question_id`) ) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
 
 
--
-- Table structure for table `iib_sc_unicode_details`
--
 
DROP TABLE IF EXISTS `iib_sc_unicode_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iib_sc_unicode_details` ( `id` int(11) NOT NULL AUTO_INCREMENT, `case_id` int(11) NOT NULL DEFAULT '0', `case_text` text, `exam_code` varchar(20) NOT NULL DEFAULT '', `subject_code` varchar(20) NOT NULL DEFAULT '', `section_code` varchar(20) NOT NULL DEFAULT '', `lang_code` varchar(5) NOT NULL, `sub_section_code` int(11) DEFAULT NULL, PRIMARY KEY (`id`), KEY `case_id` (`case_id`,`exam_code`,`subject_code`,`section_code`,`lang_code`) ) ENGINE=MyISAM DEFAULT CHARSET=latin1;
 
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dump completed on 2017-11-23 16:30:07