-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 19, 2021 at 09:28 PM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.0.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `assignment`
--
CREATE DATABASE IF NOT EXISTS `assignment` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `assignment`;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `add_by_user` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `description`, `created_at`, `updated_at`, `add_by_user`) VALUES
(1, 'Laptop', '40000', 'A demo laptop description', '2021-09-19 17:40:47', '2021-09-19 17:40:47', '1'),
(2, 'Desktop', '30000', 'This is a demo desktop description', '2021-09-19 17:41:14', '2021-09-19 17:41:14', '1'),
(3, 'Mobile', '20000', 'This is a demo mobile description', '2021-09-19 17:41:44', '2021-09-19 17:41:44', '1'),
(4, 'Spectacles', '500', 'This a demo spectacles description', '2021-09-19 17:42:16', '2021-09-19 17:42:16', '1'),
(5, 'Charger', '300', 'This a demo charger description', '2021-09-19 17:43:14', '2021-09-19 17:43:14', '1'),
(6, 'Light', '200', 'This a basic light description', '2021-09-19 19:08:04', '2021-09-19 19:08:04', '2'),
(7, 'AC', '20000', 'This a basic AC description', '2021-09-19 19:11:00', '2021-09-19 19:11:00', '1'),
(8, 'Guitar', '10000', 'This a basic guitar description', '2021-09-19 19:11:25', '2021-09-19 19:11:25', '1'),
(9, 'Sofa', '15000', 'This a basic sofa description', '2021-09-19 19:12:20', '2021-09-19 19:20:23', '2'),
(10, 'Chair', '5000', 'This a basic chair description', '2021-09-19 19:12:35', '2021-09-19 19:12:35', '1'),
(11, 'Table', '4000', 'This a basic table description', '2021-09-19 19:12:57', '2021-09-19 19:12:57', '1'),
(12, 'Curtains', '500', 'This a basic curtain description', '2021-09-19 19:13:25', '2021-09-19 19:13:25', '1'),
(13, 'Wood Planks', '5000', 'This a basic wood planks description', '2021-09-19 19:13:25', '2021-09-19 19:15:14', '1'),
(14, 'Watch', '3000', 'This a basic watch description', '2021-09-19 19:14:01', '2021-09-19 19:15:22', '1'),
(15, 'TV', '25000', 'This a basic TV description', '2021-09-19 19:14:11', '2021-09-19 19:15:31', '1'),
(16, 'Speaker', '5000', 'This a basic speaker description', '2021-09-19 19:14:28', '2021-09-19 19:15:36', '1'),
(17, 'Router', '2000', 'This a basic Router description', '2021-09-19 19:14:44', '2021-09-19 19:14:44', '2'),
(18, 'Inverter', '20000', 'This a basic inverter description', '2021-09-19 19:17:29', '2021-09-19 19:17:29', '2'),
(19, 'Headphone', '500', 'This a basic headphone description', '2021-09-19 19:20:48', '2021-09-19 19:21:48', '2');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Arnab Dey', 'arnab@test.com', '$2b$10$axtKFuZR2S4K3PGQVxqb2ObVtTWPTkNBfkKxbfKToEGu5FI3.58vq', '2021-09-19 17:38:55', '2021-09-19 17:38:55'),
(2, 'Test User', 'testuser@test.com', '$2b$10$gZ4JoLcLWbx5yq2L2hbRf.5hb1fCu5hEL57oLubIegh.vZuNtShR2', '2021-09-19 19:10:00', '2021-09-19 19:10:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
