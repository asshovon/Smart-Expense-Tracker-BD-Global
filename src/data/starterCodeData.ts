export interface StarterCodeFile {
  path: string;
  name: string;
  language: string;
  category: 'backend' | 'android' | 'docker' | 'docs' | 'database';
  content: string;
}

export const STARTER_CODE_FILES: StarterCodeFile[] = [
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml',
    language: 'yaml',
    category: 'docker',
    content: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: expense_tracker_db
    environment:
      POSTGRES_DB: expense_tracker_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secretpassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: expense_tracker_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@expensetracker.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  pgdata:
    driver: local
`,
  },
  {
    path: 'database/schema.sql',
    name: 'schema.sql',
    language: 'sql',
    category: 'database',
    content: `-- PostgreSQL Database Schema for Smart Expense Tracker BD & Global
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_currency VARCHAR(10) DEFAULT 'BDT',
    phone_number VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts / Wallets (bKash, Nagad, Bank, Cash, DPS)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- BKASH, NAGAD, BANK_ACCOUNT, CASH, DPS
    account_number VARCHAR(50),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'BDT',
    is_bd_mfs BOOLEAN DEFAULT FALSE,
    color_hex VARCHAR(20) DEFAULT '#0D9488',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories (Localized)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100),
    type VARCHAR(20) NOT NULL, -- 'expense', 'income'
    icon VARCHAR(50) DEFAULT 'Tag',
    color_hex VARCHAR(20) DEFAULT '#3B82F6',
    is_bd_specific BOOLEAN DEFAULT FALSE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    target_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'expense', 'income', 'transfer'
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
    title VARCHAR(200) NOT NULL,
    merchant VARCHAR(150),
    note TEXT,
    transfer_fee NUMERIC(10, 2) DEFAULT 0.00,
    receipt_url VARCHAR(500),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BDT',
    period VARCHAR(7) NOT NULL -- '2026-10'
);

-- Indexes for lightning fast queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);
`,
  },
  {
    path: 'backend/src/main/java/com/tracker/ExpenseTrackerApplication.java',
    name: 'ExpenseTrackerApplication.java',
    language: 'java',
    category: 'backend',
    content: `package com.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Smart Expense Tracker BD & Global
 * Production-ready Java Spring Boot Backend
 */
@SpringBootApplication
@EnableJpaAuditing
public class ExpenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseTrackerApplication.class, args);
        System.out.println("==================================================");
        System.out.println("  Smart Expense Tracker BD & Global API Started   ");
        System.out.println("  Health check: http://localhost:8080/api/health  ");
        System.out.println("  Swagger Docs: http://localhost:8080/swagger-ui  ");
        System.out.println("==================================================");
    }
}
`,
  },
  {
    path: 'backend/src/main/java/com/tracker/controller/TransactionController.java',
    name: 'TransactionController.java',
    language: 'java',
    category: 'backend',
    content: `package com.tracker.controller;

import com.tracker.dto.TransactionRequest;
import com.tracker.dto.TransactionResponse;
import com.tracker.dto.MonthlySummaryResponse;
import com.tracker.model.Transaction;
import com.tracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(transactionService.findTransactions(type, currency, month));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        return new ResponseEntity<>(transactionService.createTransaction(request), HttpStatus.CREATED);
    }

    @GetMapping("/summary")
    public ResponseEntity<MonthlySummaryResponse> getMonthlySummary(
            @RequestParam(defaultValue = "BDT") String baseCurrency,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(transactionService.getSummary(baseCurrency, month));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
`,
  },
  {
    path: 'backend/src/main/java/com/tracker/model/Transaction.java',
    name: 'Transaction.java',
    language: 'java',
    category: 'backend',
    content: `package com.tracker.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String type; // 'expense', 'income', 'transfer'

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency; // 'BDT', 'USD', 'EUR', etc.

    @Column(nullable = false)
    private String title;

    private String merchant;
    private String note;

    @Column(precision = 10, scale = 2)
    private BigDecimal transferFee;

    private String receiptUrl;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_account_id")
    private Account targetAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
`,
  },
  {
    path: 'backend/src/main/java/com/tracker/service/CurrencyConversionService.java',
    name: 'CurrencyConversionService.java',
    language: 'java',
    category: 'backend',
    content: `package com.tracker.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Multi-Currency Engine supporting BDT, USD, EUR, GBP, SAR, etc.
 */
@Service
public class CurrencyConversionService {

    // Pegged rates relative to USD (1 USD = rate)
    private final Map<String, BigDecimal> ratesToUsd = new ConcurrentHashMap<>();

    public CurrencyConversionService() {
        ratesToUsd.put("USD", BigDecimal.valueOf(1.0));
        ratesToUsd.put("BDT", BigDecimal.valueOf(122.50));
        ratesToUsd.put("EUR", BigDecimal.valueOf(0.92));
        ratesToUsd.put("GBP", BigDecimal.valueOf(0.78));
        ratesToUsd.put("INR", BigDecimal.valueOf(84.20));
        ratesToUsd.put("SAR", BigDecimal.valueOf(3.75));
        ratesToUsd.put("AED", BigDecimal.valueOf(3.67));
    }

    public BigDecimal convert(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equalsIgnoreCase(toCurrency)) {
            return amount;
        }

        BigDecimal rateFrom = ratesToUsd.getOrDefault(fromCurrency.toUpperCase(), BigDecimal.ONE);
        BigDecimal rateTo = ratesToUsd.getOrDefault(toCurrency.toUpperCase(), BigDecimal.ONE);

        // Convert to USD first
        BigDecimal inUsd = amount.divide(rateFrom, 6, RoundingMode.HALF_UP);
        // Then convert to target
        return inUsd.multiply(rateTo).setScale(2, RoundingMode.HALF_UP);
    }

    public Map<String, BigDecimal> getAllRates() {
        return ratesToUsd;
    }
}
`,
  },
  {
    path: 'backend/src/main/resources/application.yml',
    name: 'application.yml',
    language: 'yaml',
    category: 'backend',
    content: `server:
  port: 8080

spring:
  application:
    name: smart-expense-tracker-api
  datasource:
    url: jdbc:postgresql://localhost:5432/expense_tracker_db
    username: postgres
    password: secretpassword
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

jwt:
  secret: 9a4f2c8d3e7b1a5f6e8d2c4b7a9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5
  expiration-ms: 86400000 # 24 hours
`,
  },
  {
    path: 'android/app/src/main/java/com/tracker/MainActivity.java',
    name: 'MainActivity.java',
    language: 'java',
    category: 'android',
    content: `package com.tracker;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.util.ArrayList;
import java.util.List;

/**
 * Smart Expense Tracker BD & Global
 * Native Android Java Application
 */
public class MainActivity extends AppCompatActivity {

    private TextView tvTotalBalance;
    private TextView tvIncome;
    private TextView tvExpense;
    private RecyclerView rvTransactions;
    private TransactionAdapter adapter;
    private List<TransactionItem> transactionList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupSampleData();
        setupRecyclerView();
    }

    private void initViews() {
        tvTotalBalance = findViewById(R.id.tvTotalBalance);
        tvIncome = findViewById(R.id.tvMonthlyIncome);
        tvExpense = findViewById(R.id.tvMonthlyExpense);
        rvTransactions = findViewById(R.id.rvTransactions);
        FloatingActionButton fabAdd = findViewById(R.id.fabAddTransaction);

        fabAdd.setOnClickListener(v -> {
            AddTransactionBottomSheet dialog = new AddTransactionBottomSheet();
            dialog.show(getSupportFragmentManager(), "AddTransaction");
        });
    }

    private void setupSampleData() {
        tvTotalBalance.setText("৳ 2,34,500");
        tvIncome.setText("+ ৳ 1,35,000");
        tvExpense.setText("- ৳ 32,800");

        transactionList = new ArrayList<>();
        transactionList.add(new TransactionItem("October Salary", "BRAC Bank", "+ ৳ 1,10,000", "25 Oct", true));
        transactionList.add(new TransactionItem("Upwork Project", "Payoneer USD", "+ $ 650", "24 Oct", true));
        transactionList.add(new TransactionItem("House Rent (Dhanmondi)", "BRAC Bank", "- ৳ 22,000", "23 Oct", false));
        transactionList.add(new TransactionItem("DESCO Electricity Bill", "bKash", "- ৳ 2,850", "22 Oct", false));
        transactionList.add(new TransactionItem("Shwapno Superstore", "bKash", "- ৳ 5,400", "21 Oct", false));
        transactionList.add(new TransactionItem("Pathao Ride", "Nagad", "- ৳ 420", "20 Oct", false));
    }

    private void setupRecyclerView() {
        adapter = new TransactionAdapter(this, transactionList);
        rvTransactions.setLayoutManager(new LinearLayoutManager(this));
        rvTransactions.setAdapter(adapter);
    }
}
`,
  },
  {
    path: 'android/app/src/main/res/layout/activity_main.xml',
    name: 'activity_main.xml',
    language: 'xml',
    category: 'android',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#F8FAFC">

    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@android:color/transparent"
        app:elevation="0dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <!-- Top Header -->
            <RelativeLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content">

                <TextView
                    android:id="@+id/tvAppTitle"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Smart Expense BD 🇧🇩"
                    android:textSize="20sp"
                    android:textStyle="bold"
                    android:textColor="#0F172A" />

                <ImageView
                    android:layout_width="36dp"
                    android:layout_height="36dp"
                    android:layout_alignParentEnd="true"
                    android:src="@drawable/ic_avatar_placeholder" />
            </RelativeLayout>

            <!-- Balance Card -->
            <androidx.cardview.widget.CardView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="16dp"
                app:cardCornerRadius="16dp"
                app:cardElevation="4dp"
                app:cardBackgroundColor="#047857">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical"
                    android:padding="20dp">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="মোট ব্যালেন্স (Total Net Balance)"
                        android:textColor="#D1FAE5"
                        android:textSize="13sp" />

                    <TextView
                        android:id="@+id/tvTotalBalance"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="৳ 2,34,500"
                        android:textColor="#FFFFFF"
                        android:textSize="30sp"
                        android:textStyle="bold"
                        android:layout_marginTop="4dp" />

                    <!-- Income / Expense Row -->
                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:orientation="horizontal"
                        android:layout_marginTop="16dp">

                        <LinearLayout
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_weight="1"
                            android:orientation="vertical">
                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="আয় (Income)"
                                android:textColor="#A7F3D0"
                                android:textSize="12sp" />
                            <TextView
                                android:id="@+id/tvMonthlyIncome"
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="+ ৳ 1,35,000"
                                android:textColor="#FFFFFF"
                                android:textStyle="bold" />
                        </LinearLayout>

                        <LinearLayout
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_weight="1"
                            android:orientation="vertical">
                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="ব্যয় (Expense)"
                                android:textColor="#FECDD3"
                                android:textSize="12sp" />
                            <TextView
                                android:id="@+id/tvMonthlyExpense"
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="- ৳ 32,800"
                                android:textColor="#FFFFFF"
                                android:textStyle="bold" />
                        </LinearLayout>
                    </LinearLayout>
                </LinearLayout>
            </androidx.cardview.widget.CardView>
        </LinearLayout>
    </com.google.android.material.appbar.AppBarLayout>

    <!-- Recent Transactions List -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rvTransactions"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:padding="16dp"
        app:layout_behavior="@string/appbar_scrolling_view_behavior" />

    <!-- Floating Action Button (+) -->
    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fabAddTransaction"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|end"
        android:layout_margin="20dp"
        android:contentDescription="Add Transaction"
        android:backgroundTint="#059669"
        app:srcCompat="@android:drawable/ic_input_add" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'docs',
    content: `# Smart Expense Tracker BD & Global 🌍
**Full Professional Expense Tracker System | Java + Android + Web + Cloud Database**

## 🇧🇩 সিস্টেম পরিচিতি ও ফিচারসমূহ
১. **বাংলাদেশ ও গ্লোবাল মাল্টি-কারেন্সি:** BDT (৳), USD ($), EUR (€), GBP (£), INR (₹), SAR (﷼) এবং অন্যান্য।
২. **বাংলাদেশি MFS ও ব্যাংক ইন্টিগ্রেশন:** বিকাশ (bKash), নগদ (Nagad), রকেট, সিটি ব্যাংক, ব্র্যাক ব্যাংক, নগদ টাকা, ডিপিএস (DPS) এবং পেওনিয়ার/ফ্রিল্যান্সিং ওয়ালেট।
৩. **আয়-ব্যয় ব্যবস্থাপনা ও বাজেট ট্র্যাকার:** মাসিক ক্যাটাগরি অনুযায়ী বাজেট রিমাইন্ডার এবং এক্সপেন্স এনালাইটিক্স।
৪. **বাংলাদেশি স্পেশাল টুলস:** যাকাত ক্যালকুলেটর (Zakat Calculator with Nisab) ও ব্যাংক ডিপিএস ক্যালকুলেটর (DPS Maturity Calculator)।
৫. **প্রতিবেদন ও এক্সপোর্ট:** CSV, PDF এবং Excel রিপোর্ট এক্সপোর্ট।

---

## 🚀 How to Run the Complete Stack

### 1. Requirements
- Docker & Docker Compose
- Java JDK 21+
- Apache Maven 3.9+
- Android Studio Ladybug or newer

### 2. Start PostgreSQL Database
\`\`\`bash
docker compose up -d
\`\`\`
Check database status:
\`\`\`bash
docker compose ps
\`\`\`

### 3. Run Java Spring Boot Backend
\`\`\`bash
cd backend
mvn clean spring-boot:run
\`\`\`
API will be live at: \`http://localhost:8080/api/health\`

### 4. Run Android App
1. Open \`android/\` folder in Android Studio.
2. Allow Gradle sync to complete.
3. Select an Android Emulator (API 34+) or your Android smartphone with USB debugging enabled.
4. Click **Run (Shift + F10)**.

### 5. Open Web Dashboard
Open \`web/index.html\` in any modern web browser or run with Vite / Live Server.
`,
  },
];
