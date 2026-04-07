CREATE DATABASE  IF NOT EXISTS `students` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `students`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: students
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (3,'Admin','futureminds60@gmail.com','$2b$10$qUludSiPjxLPaPzD5xHE..zp8vYp0sxDwAcq3bXUcOyKA/azXrmsC','2026-02-16 20:27:16');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content_progress`
--

DROP TABLE IF EXISTS `content_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `content_id` int DEFAULT NULL,
  `status` enum('Completed','In-Progress') DEFAULT 'Completed',
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_content` (`student_id`,`content_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `content_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `content_progress_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `coursecontent` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content_progress`
--

LOCK TABLES `content_progress` WRITE;
/*!40000 ALTER TABLE `content_progress` DISABLE KEYS */;
INSERT INTO `content_progress` VALUES (5,32,22,'Completed','2026-04-06 20:44:47');
/*!40000 ALTER TABLE `content_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_payments`
--

DROP TABLE IF EXISTS `course_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_slip` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_payments`
--

LOCK TABLES `course_payments` WRITE;
/*!40000 ALTER TABLE `course_payments` DISABLE KEYS */;
INSERT INTO `course_payments` VALUES (54,25,4,1500.00,'Approved','Online','2026-03-30 14:56:47',NULL,NULL),(55,25,1,2500.00,'Approved','Online','2026-03-30 14:57:30',NULL,NULL),(56,25,5,2000.00,'Pending','Bank','2026-03-30 14:58:01','uploads\\slips\\b46d4fbeb9826ef35c59831af798cb2b',NULL),(57,25,8,200.00,'Pending','Bank','2026-03-30 15:02:45','uploads\\slips\\1a7f5334c6f5c17c17f948b276175173',NULL),(58,25,12,300.00,'Pending','Bank','2026-03-30 15:17:23','uploads\\slips\\c1ea522bc3dae2fd86a51135444772a7','INV-CR-12-843731'),(59,25,31,20000.00,'Pending','Online','2026-04-01 08:47:00',NULL,NULL),(60,25,31,20000.00,'Approved','Online','2026-04-01 08:50:10',NULL,NULL),(61,25,9,200.00,'Approved','Online','2026-04-01 15:14:33',NULL,NULL),(62,25,8,200.00,'Approved','Online','2026-04-01 15:15:27',NULL,NULL),(63,25,23,12000.00,'Approved','Online','2026-04-01 15:18:04',NULL,NULL),(64,25,24,20000.00,'Approved','Online','2026-04-01 16:05:48',NULL,NULL),(65,25,27,13000.00,'Approved','Online','2026-04-01 16:09:11',NULL,NULL),(66,27,21,15000.00,'Approved','Online','2026-04-02 13:06:26',NULL,NULL),(67,27,1,2500.00,'Pending','Bank','2026-04-02 13:28:34','uploads\\slips\\987906211b586fd31bf4fbd33764bf02','INV-CR-1-513955'),(68,27,4,1500.00,'Pending','Bank','2026-04-02 13:40:51','uploads\\slips\\9e94bc4f9ba0d2b79f6a46f29dc86181','INV-CR-4-251332'),(69,28,1,2500.00,'Pending','Bank','2026-04-02 19:33:24','uploads\\slips\\a7eeef1fca9b35a05c890307fe0d2e07','INV-CR-1-404629'),(70,28,48,2000.00,'Approved','Online','2026-04-02 19:47:04',NULL,NULL),(71,3,1,2500.00,'Approved','Online','2026-04-04 09:22:59',NULL,NULL),(72,3,21,15000.00,'Pending','Online','2026-04-05 09:15:13',NULL,NULL),(73,32,1,2500.00,'Approved','Online','2026-04-05 13:55:34',NULL,NULL),(74,32,21,15000.00,'Approved','Online','2026-04-05 14:21:24',NULL,NULL),(75,32,20,24000.00,'Approved','Online','2026-04-05 14:27:13',NULL,NULL),(76,32,4,1500.00,'Approved','Online','2026-04-06 17:14:18',NULL,NULL),(77,32,16,25000.00,'Approved','Online','2026-04-06 17:29:00',NULL,NULL),(78,32,18,28000.00,'Approved','Online','2026-04-06 18:46:28',NULL,NULL),(79,28,4,1500.00,'Pending','Online','2026-04-07 14:20:31',NULL,NULL),(80,28,4,1500.00,'Approved','Online','2026-04-07 16:53:09',NULL,NULL);
/*!40000 ALTER TABLE `course_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursecontent`
--

DROP TABLE IF EXISTS `coursecontent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursecontent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(10) DEFAULT NULL,
  `content_type` enum('UPLOAD_VIDEO','YOUTUBE','ZOOM','PDF','ASSIGNMENT','VIDEO','LINK') DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `external_link` text,
  PRIMARY KEY (`id`),
  KEY `course_code` (`course_code`),
  CONSTRAINT `coursecontent_ibfk_1` FOREIGN KEY (`course_code`) REFERENCES `courses` (`course_code`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursecontent`
--

LOCK TABLES `coursecontent` WRITE;
/*!40000 ALTER TABLE `coursecontent` DISABLE KEYS */;
INSERT INTO `coursecontent` VALUES (21,'S002','PDF','lesson1pdf','http://localhost:5000/uploads/1775496640802.pdf'),(22,'S002','VIDEO','lessn2 internl vdeo','http://localhost:5000/uploads/1775496671684.mp4'),(25,'T003','VIDEO','Network Security(Video Lesson:)','https://www.youtube.com/watch?v=inWWhr5tnu4'),(26,'T003','LINK','Zoom Class(Passcode: Cyber2026)','https://zoom.us/j/9988776655'),(27,'T003','PDF','Reading Material:','http://localhost:5000/uploads/1775580485675.pdf'),(30,'T004','VIDEO','Introduction to AWS','https://www.youtube.com/watch?v=M988_IT6Kn0'),(31,'T004','LINK','AWS Free Tier Guide','https://aws.amazon.com/free/'),(32,'T005','LINK','Documentation','https://docs.expo.dev/'),(33,'T005','LINK','Basic To-Do App Starter Ki','https://github.com/FutureMinds/Mobile-Starter'),(34,'T005','VIDEO','Video Lesson','http://localhost:5000/uploads/1775582360354.mp4'),(35,'S002','VIDEO','External video','http://localhost:5000/uploads/1775582383030.mp4');
/*!40000 ALTER TABLE `coursecontent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(10) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `descriptions` text,
  `price` decimal(10,2) DEFAULT NULL,
  `category` enum('Science','Technology','Mathematics') NOT NULL,
  `materials_link` varchar(255) DEFAULT 'Not Available',
  `course_img` varchar(255) DEFAULT 'default-image.jpg',
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (4,'S002','Physics Basics','Intro to physics',1500.00,'Science','Not Available','https://tse4.mm.bing.net/th/id/OIP.akXBatOPkxaOJ-_xryQ-jgHaH5?rs=1&pid=ImgDetMain&o=7&rm=3'),(16,'T001','Full-Stack Web Dev','Master frontend and backend using React, Node.js, and MongoDB.',25000.00,'Technology','Not Available','https://th.bing.com/th/id/OIP.HyQZYt6CuYFm_NFtOEU5KwHaEK?w=294&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),(17,'T002','AI & Machine Learning','Build intelligent systems using Python, TensorFlow and Scikit-learn.',30000.00,'Technology','Not Available','https://th.bing.com/th/id/OIP.q8UKRnlu1_res0eBSF5JGgHaFC?w=249&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),(18,'T003','Cyber Security','Protect networks and systems from digital attacks and threats.',28000.00,'Technology','Not Available','https://th.bing.com/th/id/OIP.hMzf3Wdt9or-3p1qDj0gSgHaEJ?w=310&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),(19,'T004','Cloud Computing','Deploy and manage scalable applications on the AWS Cloud.',22000.00,'Technology','Not Available','https://tse4.mm.bing.net/th/id/OIP.an-n5ScmAeKk_w1yvqG1VwHaE7?pid=ImgDet&w=186&h=124&c=7&o=7&rm=3'),(20,'T005','Mobile App Dev','Create cross-platform mobile apps for iOS and Android with Flutter.',24000.00,'Technology','Not Available','https://th.bing.com/th/id/OIP.q8UKRnlu1_res0eBSF5JGgHaFC?w=249&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),(21,'S013','Quantum Physics','Explore the fundamental particles and forces of our universe.',15000.00,'Science','Not Available','https://th.bing.com/th/id/OIP.9WVWnU6kxres3aGSUEzaDAHaE8?w=293&h=196&c=7&r=0&o=7&pid=1.7&rm=3'),(22,'S014','Molecular Biology','Detailed study of cellular structures and genetic mapping.',18000.00,'Science','Not Available','https://th.bing.com/th/id/OIP.iqzAqi7Uddl4Ms0_uxXw7wHaEK?w=307&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),(24,'S016','Astrophysics','Journey through stars, black holes, and the cosmos history.',20000.00,'Science','Not Available','https://th.bing.com/th/id/OIP.cHNVoijKtio01uuYROLrdQHaE7?w=259&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),(25,'S017','Organic Chemistry','In-depth study of carbon compounds and chemical reactions.',16000.00,'Science','Not Available','https://th.bing.com/th/id/OIP.FcGAJQmur8QvJ_1vzK6E6gHaFb?w=296&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),(26,'M002','Advanced Calculus','Master limits, derivatives, and complex integration techniques.',14000.00,'Mathematics','Not Available','https://th.bing.com/th/id/OIP.SMBGO4fOXY5oC3kJvcknGAHaE8?w=276&h=184&c=7&r=0&o=7&pid=1.7&rm=3'),(27,'M003','Linear Algebra','Study vector spaces and matrices for data science and AI.',13000.00,'Mathematics','Not Available','https://th.bing.com/th/id/OIP.w_smHtjn0PobC1fGiT6PfwHaEj?w=317&h=196&c=7&r=0&o=7&pid=1.7&rm=3'),(49,'T006','Modern Web Development','Master HTML, CSS, and React from scratch.',2500.00,'Technology','Not Available','https://th.bing.com/th/id/OIP.vS2l-T0qkDv9LsAjXohRgAHaE8?w=261&h=180&c=7&r=0&o=7&pid=1.7&rm=3');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `course_id` int NOT NULL,
  `enroll_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `progress` int DEFAULT '0',
  `payment_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `payment_method` enum('Online','Bank') DEFAULT 'Bank',
  `payment_slip` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`enrollment_id`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=228 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (159,25,4,'2026-03-30 14:57:00',0,'Approved','Online',NULL,'INV-00054'),(197,25,24,'2026-04-01 16:06:01',0,'Approved','Online',NULL,'INV-00064'),(200,25,27,'2026-04-01 16:09:27',0,'Approved','Online',NULL,'INV-00065'),(203,27,21,'2026-04-02 13:06:41',0,'Approved','Online',NULL,'INV-00066'),(206,27,4,'2026-04-02 13:40:51',0,'Rejected','Bank','uploads\\slips\\9e94bc4f9ba0d2b79f6a46f29dc86181','INV-CR-4-251332'),(214,32,21,'2026-04-05 14:21:38',0,'Approved','Online',NULL,'INV-00074'),(216,32,20,'2026-04-05 14:27:25',0,'Approved','Online',NULL,'INV-00075'),(220,32,4,'2026-04-06 17:15:04',0,'Approved','Online',NULL,'INV-00076'),(222,32,16,'2026-04-06 17:29:12',0,'Approved','Online',NULL,'INV-00077'),(224,32,18,'2026-04-06 18:46:40',0,'Approved','Online',NULL,'INV-00078'),(226,28,4,'2026-04-07 16:53:24',0,'Approved','Online',NULL,'INV-00080');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int DEFAULT NULL,
  `question_text` text,
  `option_a` text,
  `explanation_a` text,
  `option_b` text,
  `explanation_b` text,
  `option_c` text,
  `explanation_c` text,
  `option_d` text,
  `explanation_d` text,
  `correct_option` char(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `questions_ibfk_1` (`quiz_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (2978,30,'Sum of internal angles in a triangle is?','90','Incorrect','180','Correct','270','Incorrect','360','Incorrect','B'),(2979,30,'The area of a circle is given by?','2*pi*r','Circumference','pi*r^2','Correct formula','pi*d','Incorrect','1/2*b*h','Triangle area','B'),(2980,30,'How many sides does a Hexagon have?','5','Pentagon','6','Correct','7','Heptagon','8','Octagon','B'),(2981,30,'A right angle is exactly?','45 degrees','Acute','90 degrees','Correct','180 degrees','Straight','360 degrees','Full','B'),(2982,30,'The longest side of a right-angled triangle is?','Base','Incorrect','Height','Incorrect','Hypotenuse','Correct','Tangent','Incorrect','C'),(2983,31,'Which organ pumps blood in the human body?','Brain','Incorrect','Lungs','Incorrect','Heart','Correct','Liver','Incorrect','C'),(2984,31,'What is the powerhouse of the cell?','Nucleus','Incorrect','Ribosome','Incorrect','Mitochondria','Correct','Vacuole','Incorrect','C'),(2985,31,'Which gas do plants absorb during photosynthesis?','Oxygen','Produced','Carbon Dioxide','Absorbed','Nitrogen','Incorrect','Hydrogen','Incorrect','B'),(2986,31,'How many bones are in an adult human body?','106','Too low','206','Correct','306','Too high','406','Too high','B'),(2987,31,'Which vitamin is primarily obtained from sunlight?','Vitamin A','Incorrect','Vitamin B','Incorrect','Vitamin C','Incorrect','Vitamin D','Correct','D'),(2988,32,'Which organ pumps blood in the human body?','Brain','Incorrect','Lungs','Incorrect','Heart','Correct','Liver','Incorrect','C'),(2989,32,'What is the powerhouse of the cell?','Nucleus','Incorrect','Ribosome','Incorrect','Mitochondria','Correct','Vacuole','Incorrect','C'),(2990,32,'Which gas do plants absorb during photosynthesis?','Oxygen','Produced','Carbon Dioxide','Absorbed','Nitrogen','Incorrect','Hydrogen','Incorrect','B'),(2991,32,'How many bones are in an adult human body?','106','Too low','206','Correct','306','Too high','406','Too high','B'),(2992,32,'Which vitamin is primarily obtained from sunlight?','Vitamin A','Incorrect','Vitamin B','Incorrect','Vitamin C','Incorrect','Vitamin D','Correct','D'),(2993,33,'What is the chemical symbol for Water?','CO2','Carbon Dioxide','H2O','Correct','NaCl','Salt','O2','Oxygen','B'),(2994,33,'Which planet is known as the Red Planet?','Venus','Incorrect','Mars','Correct','Jupiter','Incorrect','Saturn','Incorrect','B'),(2995,33,'What is the SI unit of Force?','Watt','Power','Pascal','Pressure','Newton','Correct','Joule','Energy','C'),(2996,33,'What is the speed of light approximately?','3x10^5 m/s','Incorrect','3x10^8 m/s','Correct','3x10^10 m/s','Incorrect','1500 m/s','Sound','B'),(2997,33,'Which metal is liquid at room temperature?','Iron','Solid','Mercury','Correct','Gold','Solid','Aluminum','Solid','B'),(2998,34,'What does HTML stand for?','High Tech Machine Language','Incorrect','Hyper Text Markup Language','Correct','Hyper Tabular Main Line','Incorrect','Hyper Tool Multi Link','Incorrect','B'),(2999,34,'Which of these is a JavaScript Framework?','Django','Python','Laravel','PHP','React','Correct','Flask','Python','C'),(3000,34,'What does SQL stand for?','Simple Query Language','Incorrect','Structured Query Language','Correct','System Quick Link','Incorrect','Standard Queue List','Incorrect','B'),(3001,34,'Which port does HTTP normally use?','21','FTP','25','SMTP','80','Correct','443','HTTPS','C'),(3002,34,'Who is known as the father of Computers?','Alan Turing','Incorrect','Charles Babbage','Correct','Bill Gates','Incorrect','Steve Jobs','Incorrect','B'),(3003,35,'What is the brain of a computer?','RAM','Memory','CPU','Correct','HDD','Storage','GPU','Graphics','B'),(3004,35,'What does AI stand for?','Automatic Intelligence','Incorrect','Artificial Intelligence','Correct','Advanced Internet','Incorrect','Actual Info','Incorrect','B'),(3005,35,'Which of these is a non-volatile memory?','RAM','Volatile','ROM','Correct','Cache','Volatile','Register','Volatile','B'),(3006,35,'1 Terabyte (TB) is equal to?','1024 MB','Incorrect','1024 GB','Correct','1000 KB','Incorrect','512 GB','Incorrect','B'),(3007,35,'What is the primary purpose of an Operating System?','Gaming','Incorrect','Word Processing','Incorrect','Managing Resources','Correct','Browsing','Incorrect','C');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `quiz_id` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `total_questions` int DEFAULT NULL,
  `attempt_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quiz_attempts_ibfk_1` (`quiz_id`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_enrollments`
--

DROP TABLE IF EXISTS `quiz_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_enrollments` (
  `quiz_enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `enroll_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `payment_method` enum('Online','Bank') DEFAULT 'Bank',
  `payment_slip` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`quiz_enrollment_id`),
  UNIQUE KEY `unique_quiz_enrollment` (`student_id`,`quiz_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `quiz_enrollments_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_enrollments`
--

LOCK TABLES `quiz_enrollments` WRITE;
/*!40000 ALTER TABLE `quiz_enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_payments`
--

DROP TABLE IF EXISTS `quiz_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `quiz_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `payment_slip` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quiz_payments_ibfk_1` (`quiz_id`),
  CONSTRAINT `quiz_payments_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_payments`
--

LOCK TABLES `quiz_payments` WRITE;
/*!40000 ALTER TABLE `quiz_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `qdescription` text,
  `expires_at` datetime DEFAULT NULL,
  `time_limit_minutes` int DEFAULT '0',
  `price` decimal(10,2) DEFAULT '0.00',
  `course_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Quiz_IMG` varchar(255) DEFAULT 'default-image.jpg',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (30,'Algebra Essentials','Master the fundamentals of Algebra, including linear equations and square roots.',NULL,10,2000.00,'S002','2026-04-07 16:37:39','https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'),(31,'Geometry Mastery','Explore shapes, angles, and area calculations in this comprehensive geometry quiz.',NULL,20,3000.00,'M002','2026-04-07 16:38:37','https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400'),(32,'Biology Foundations','A deep dive into human anatomy, plant cells, and biological systems.',NULL,30,3000.00,'S013','2026-04-07 16:39:28','https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400'),(33,'Physics & Chemistry','Test your knowledge of chemical symbols, light speed, and basic physics laws.',NULL,10,2000.00,'S014','2026-04-07 16:40:02','https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400'),(34,'Web Development 101','Test your skills in modern web technologies including HTML, CSS, and React.',NULL,20,2000.00,'T001','2026-04-07 16:40:47','https://images.unsplash.com/photo-1547658719-da2b51169166?w=400'),(35,'AI & Computing','Learn about computer architecture, memory types, and Artificial Intelligence.',NULL,20,2498.00,'T004','2026-04-07 16:41:23','https://images.unsplash.com/photo-1518770660439-4636190af475?w=400');
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `login_attempts` int DEFAULT '0',
  `lock_until` datetime DEFAULT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `reset_token` varchar(100) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `forgot_otp` varchar(6) DEFAULT NULL,
  `forgot_otp_expiry` datetime DEFAULT NULL,
  `status` enum('Active','Deactive') DEFAULT 'Active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (25,'John Doew','arachchige789@gmail.comw','0771234500','$2b$10$kYtlpDlnr4Ef5LVpxi0NsunmtEpQtaMe1UvzJtvDRpydWe46rfrQO','2026-02-16 20:03:46',0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'Active'),(27,'savindi nisansala','shageekahirushi@gmail.com','1111111111','$2b$10$tPu3IjZ0UMRqLIkWYrtmeeM8ir6/0tEV7P8dO55bxCauE034AeqDW','2026-04-02 12:12:23',0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'Active'),(28,'Hirushi Divyajalie','hirushidivyanjalie12@gmail.com','0761758933','$2b$10$GLksvky4tZiFTWz8XmuOQO660iB6f39jlOGEZVJWd8CQle1hzSdBi','2026-04-02 19:31:06',0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'Active'),(32,'Divya','cinematicbeat1@gmail.com','0888888888','$2b$10$oWc8kp.PiWkkWZK3GJhj2utzPsxn.9KfEs2.GQefXS3SItUcUOUDq','2026-04-04 21:10:16',0,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'Active');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-07 23:46:15
