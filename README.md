# Personal Finance Application

## Overview

This application enables users to manage their personal finances by uploading CSV files from their banks (Currently Nordea). It processes these files to categorize transactions using an AI model, providing insights into spending habits and financial health.

## Features

- **CSV File Upload**: Import financial data by uploading CSV files from your bank.
- **Transaction Categorization**: Automatically categorize transactions using an AI-driven labeling system.
- **Financial Insights**: View key metrics such as monthly income, expenses, and categorized transaction lists.
- **Data Storage**: Storage of financial data in PostgreSQL databases.
- **Asynchronous Processing**: Utilizes Celery for efficient background processing of transaction labeling.

## Technologies Used

- **Backend**: FastAPI/Python
- **Frontend**: Angular/Typescript
- **Database**: PostgreSQL
- **Background Tasks**: Celery with Redis
- **AI Model**: Custom model developed for transaction categorization

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Mubashir-M/Personal-finance.git
   cd Personal-finance
   ```
