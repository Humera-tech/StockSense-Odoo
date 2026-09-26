# StockSense

StockSense is a modular Inventory Management System developed for the Odoo Hackathon.

The system is designed to digitize and streamline stock-related operations within a business by providing a centralized interface for inventory management.

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS

## Features

### Authentication
- User Sign Up
- User Login
- OTP-based Password Reset

### Dashboard
- Total Products in Stock
- Low Stock / Out of Stock Items
- Pending Receipts
- Pending Deliveries
- Internal Transfers Scheduled
- Dynamic inventory filters

### Product Management
- Create and update products
- Stock availability by location
- Product categories
- Reordering rules

### Operations
- Receipts (Incoming Stock)
- Delivery Orders (Outgoing Stock)
- Internal Transfers
- Inventory Adjustments
- Move History

### Additional Features
- Low-stock alerts
- Multi-warehouse support
- SKU search and smart filters

## Project Structure

```text
src/
├── assets/
├── components/
├── pages/
├── routes/
├── context/
├── services/
├── types/
├── data/
├── App.tsx
├── main.tsx
└── index.css