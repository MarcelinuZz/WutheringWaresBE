-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 08 Bulan Mei 2026 pada 15.49
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wuthering_wares`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `auth_codes`
--

CREATE TABLE `auth_codes` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `code` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `bind_codes`
--

CREATE TABLE `bind_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(64) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bind_codes`
--

INSERT INTO `bind_codes` (`id`, `code`, `provider`, `provider_id`, `created_at`, `expires_at`, `is_used`) VALUES
(1, 'cefa959023ba73d5c950040bc18833878151f58235677bce1eac8e7922ec56d0', 'google', '101357322244149981937', '2026-05-07 18:26:18', '2026-05-08 01:31:18', 1),
(2, '84eaa29bea94ccb73afb953be6f3c19c73763d9a8bd794964c02291652227b5a', 'google', '101357322244149981937', '2026-05-07 18:30:05', '2026-05-08 01:35:05', 1),
(3, '2f05baa332048d0eec650cd7b308ee3b4cd1a8828ec13add1eb31ba103836439', 'discord', '1501955162082643988', '2026-05-07 18:36:08', '2026-05-08 01:41:08', 1),
(4, '104ac4270b44df65d4100074cd7e8884fea50fe9cc397edda8b231f91cea2475', 'google', '101357322244149981937', '2026-05-07 18:42:08', '2026-05-08 01:47:08', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `equipments`
--

CREATE TABLE `equipments` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `price` bigint(20) NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rarity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `otp_codes`
--

CREATE TABLE `otp_codes` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `otp_codes`
--

INSERT INTO `otp_codes` (`id`, `email`, `otp_code`, `created_at`, `expires_at`, `is_verified`) VALUES
(1, 'linus@gmail.com', '589001', '2026-05-07 15:47:32', '2026-05-07 22:52:32', 0),
(4, 'wijayaoeymarcelinus@gmail.com', '930970', '2026-05-07 18:29:01', '2026-05-08 01:34:01', 0),
(7, 'efwarms@gmail.com', '833385', '2026-05-08 06:31:34', '2026-05-08 13:36:34', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `total_price` bigint(20) NOT NULL,
  `tax` bigint(20) DEFAULT 0,
  `grand_total` bigint(20) NOT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_details`
--

CREATE TABLE `transaction_details` (
  `id` varchar(36) NOT NULL,
  `transaction_id` varchar(36) NOT NULL,
  `equipment_id` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `role`, `created_at`) VALUES
('f924601d-078f-4518-b26c-790cf58a41b6', 'Administrator', 'admin@mhslab.com', 'admin', '2026-05-08 06:36:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_identities`
--

CREATE TABLE `user_identities` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_passwords`
--

CREATE TABLE `user_passwords` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user_passwords`
--

INSERT INTO `user_passwords` (`id`, `user_id`, `password`) VALUES
('5d28d68e-914b-4c31-9686-67b8dbecd5ad', 'f924601d-078f-4518-b26c-790cf58a41b6', '$2b$12$DvzteDNxHDtfr8hDrrjYN.JDLWiPNiad9D0L13vmyiGc2IyxjZCma');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user_tokens`
--

INSERT INTO `user_tokens` (`id`, `user_id`, `token`, `created_at`, `expires_at`) VALUES
(29, 'f924601d-078f-4518-b26c-790cf58a41b6', 'LfgiaFWDL5mRHgrRlN1NEDRkfjXfnD2L', '2026-05-08 06:40:59', '2026-05-10 06:40:59');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `auth_codes`
--
ALTER TABLE `auth_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `bind_codes`
--
ALTER TABLE `bind_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indeks untuk tabel `equipments`
--
ALTER TABLE `equipments`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `equipment_id` (`equipment_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `user_identities`
--
ALTER TABLE `user_identities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `user_passwords`
--
ALTER TABLE `user_passwords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `auth_codes`
--
ALTER TABLE `auth_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `bind_codes`
--
ALTER TABLE `bind_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `auth_codes`
--
ALTER TABLE `auth_codes`
  ADD CONSTRAINT `auth_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD CONSTRAINT `transaction_details_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_details_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipments` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_identities`
--
ALTER TABLE `user_identities`
  ADD CONSTRAINT `user_identities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_passwords`
--
ALTER TABLE `user_passwords`
  ADD CONSTRAINT `user_passwords_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
