# 🏢 HR Management System - Complete Architecture Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Security Architecture](#security-architecture)
7. [Anti-Fraud Attendance System](#anti-fraud-attendance-system)
8. [API Structure](#api-structure)
9. [User Interface Structure](#user-interface-structure)
10. [Deployment Architecture](#deployment-architecture)
11. [Development Phases](#development-phases)
12. [Cost Analysis](#cost-analysis)

---

## 🎯 Project Overview

### Business Context
- **Company**: สปป.ลาว บริษัทแห่งหนึ่ง
- **Employee Count**: ~200 คน ทั่วประเทศ
- **Development Team**: 1 Developer
- **Timeline**: จำกัด (MVP-First Approach)
- **Security Level**: สูง (ข้อมูลความลับบริษัท)

### Core Features Required
1. **Employee Management** - จัดการข้อมูลพนักงาน, org chart
2. **Attendance System** - ลงเวลาผ่านมือถือ (Anti-fraud)
3. **Leave Management** - ระบบลา, อนุมัติ
4. **Payroll System** - คำนวณเงินเดือน, ภาษี (กฎหมายลาว)
5. **Performance Review** - ประเมินผลงาน
6. **Recruitment** - สรรหาพนักงาน
7. **Training Management** - จัดการฝึกอบรม

### Laos-Specific Features
- **Government Compliance** - เชื่อมต่อระบบประกันสังคม, รายงานกระทรวง
- **Multi-language** - ลาว, อังกฤษ, ไทย
- **Buddhist Calendar** - วันหยุดทางศาสนา
- **LAK Currency** - จัดการเงินตราลาว
- **Province Management** - จัดการสาขาตามจังหวัด

---

## 🔧 System Requirements

### Functional Requirements
- **Multi-platform Access** - Web, Mobile (PWA)
- **Real-time Updates** - Notifications, Status Changes
- **Offline Capability** - Attendance logging offline
- **Multi-language Support** - Dynamic language switching
- **Role-based Access** - ควบคุมสิทธิ์ตามตำแหน่ง
- **Audit Trail** - บันทึกการเปลี่ยนแปลงทั้งหมด

### Non-Functional Requirements
- **Performance** - Response time < 2 seconds
- **Scalability** - รองรับ 500+ users ในอนาคต
- **Availability** - 99.5% uptime
- **Security** - End-to-end encryption
- **Compliance** - GDPR-like, Laos Labor Law
- **Mobile-First** - Responsive design

---

## 🛠️ Technology Stack

### Frontend Stack
```
Framework: Next.js 14 (App Router)
├── React 18 (UI Components)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
├── ShadCN/UI (Component Library)
├── React Hook Form + Zod (Form Management)
├── Framer Motion (Animations)
├── PWA Support (Mobile Experience)
└── i18next (Internationalization)
```

### Backend Stack
```
Backend-as-a-Service: firebase
├── PostgreSQL Database
├── Authentication & Authorization
├── Real-time Subscriptions
├── File Storage
├── Edge Functions (Serverless)
├── Row Level Security (RLS)
└── Auto-generated APIs
```

### Development Tools
```
Version Control: Git + GitHub
IDE: VS Code + Extensions
Package Manager: npm/yarn
Deployment: Vercel (Frontend) + Firebase Cloud
Monitoring: Vercel Analytics + Firebase Insights
```

### Third-party Integrations
```
Maps: Google Maps API (Location tracking)
Notifications: Firebase Cloud Messaging
File Processing: PDF.js, ExcelJS
Charts: Recharts, Chart.js
Communication: WhatsApp Business API (Laos popular)
```

---

## 🏗️ System Architecture

### Overall Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   API Gateway   │    │    Database     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Web App     │ │◄──►│ │ Firebase    │ │◄──►│ │ PostgreSQL  │ │
│ │ (Next.js)   │ │    │ │ REST API    │ │    │ │ Database    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Mobile PWA  │ │◄──►│ │ Real-time   │ │◄──►│ │ File        │ │
│ │ (Offline)   │ │    │ │ WebSocket   │ │    │ │ Storage     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
Frontend (Next.js)
├── app/ (App Router)
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── employees/
│   ├── attendance/
│   ├── leave/
│   ├── payroll/
│   ├── performance/
│   ├── recruitment/
│   └── training/
├── components/
│   ├── ui/ (ShadCN Components)
│   ├── forms/
│   ├── charts/
│   ├── tables/
│   └── layout/
├── lib/
│   ├── firebase.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations.ts
└── types/
    └── database.types.ts
```

---

## 🗄️ Database Schema

### Core Tables Overview
```sql
-- 1. Organization Structure
organizations
departments
positions
employee_positions

-- 2. User Management
users (Firebase Auth)
user_profiles
user_roles
permissions

-- 3. Employee Management
employees
employee_contacts
employee_documents
employee_emergency_contacts

-- 4. Attendance System
attendance_records
attendance_locations
attendance_photos
attendance_anomalies

-- 5. Leave Management
leave_types
leave_requests
leave_approvals
leave_balances

-- 6. Payroll System
salary_grades
salary_components
payroll_periods
payroll_records
tax_settings

-- 7. Performance Management
performance_cycles
performance_reviews
performance_goals
performance_ratings

-- 8. Recruitment
job_positions
job_applications
interview_schedules
recruitment_pipeline

-- 9. Training
training_programs
training_sessions
training_enrollments
training_certificates

-- 10. System Tables
audit_logs
notifications
system_settings
```

### Detailed Table Structures

#### 1. Organizations & Structure
```sql
-- Organization hierarchy
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_lo VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'company', 'branch', 'office'
    parent_id UUID REFERENCES organizations(id),
    address JSONB, -- {street, city, province, postal_code, country}
    contact_info JSONB, -- {phone, email, fax, website}
    tax_number VARCHAR(100),
    registration_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Department structure
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_lo VARCHAR(255),
    code VARCHAR(50) NOT NULL,
    description TEXT,
    parent_department_id UUID REFERENCES departments(id),
    manager_id UUID, -- Will reference employees(id)
    budget_code VARCHAR(50),
    cost_center VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Position/Job titles
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_lo VARCHAR(255),
    code VARCHAR(50) NOT NULL,
    level INTEGER, -- 1=Entry, 2=Junior, 3=Senior, 4=Lead, 5=Manager
    grade VARCHAR(10), -- A1, A2, B1, etc.
    description TEXT,
    requirements JSONB, -- {education, experience, skills}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Employee Management
```sql
-- Main employee record
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    first_name_lo VARCHAR(100),
    last_name_lo VARCHAR(100),
    full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    
    -- Identity
    national_id VARCHAR(50) UNIQUE,
    passport_number VARCHAR(50),
    driving_license VARCHAR(50),
    
    -- Personal Details
    date_of_birth DATE,
    gender VARCHAR(10), -- 'male', 'female', 'other'
    marital_status VARCHAR(20), -- 'single', 'married', 'divorced', 'widowed'
    nationality VARCHAR(50) DEFAULT 'Lao',
    religion VARCHAR(50),
    
    -- Contact Information
    personal_email VARCHAR(255),
    work_email VARCHAR(255),
    phone_personal VARCHAR(20),
    phone_work VARCHAR(20),
    address JSONB, -- {street, village, district, province, postal_code}
    
    -- Employment Information
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    department_id UUID REFERENCES departments(id),
    direct_manager_id UUID REFERENCES employees(id),
    
    -- Employment Status
    employment_type VARCHAR(20) NOT NULL, -- 'permanent', 'contract', 'probation', 'intern'
    employment_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'terminated', 'resigned'
    hire_date DATE NOT NULL,
    probation_end_date DATE,
    contract_start_date DATE,
    contract_end_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    
    -- Profile
    profile_photo_url TEXT,
    bio TEXT,
    
    -- System
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES employees(id),
    updated_by UUID REFERENCES employees(id)
);

-- Employee positions (current and historical)
CREATE TABLE employee_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    position_id UUID REFERENCES positions(id) NOT NULL,
    department_id UUID REFERENCES departments(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT true,
    salary_grade VARCHAR(10),
    reporting_manager_id UUID REFERENCES employees(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES employees(id)
);

-- Emergency contacts
CREATE TABLE employee_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Employee documents
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'contract', 'id_copy', 'certificate', 'resume'
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT NOW(),
    uploaded_by UUID REFERENCES employees(id),
    expiry_date DATE, -- For certificates, licenses
    is_confidential BOOLEAN DEFAULT false,
    notes TEXT
);
```

#### 3. Attendance System
```sql
-- Attendance records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    date DATE NOT NULL,
    
    -- Check-in Information
    check_in_time TIMESTAMP,
    check_in_location POINT, -- GPS coordinates
    check_in_address TEXT,
    check_in_photo_url TEXT,
    check_in_device_info JSONB, -- {device_id, browser, ip_address}
    check_in_method VARCHAR(20), -- 'gps', 'wifi', 'manual'
    
    -- Check-out Information
    check_out_time TIMESTAMP,
    check_out_location POINT,
    check_out_address TEXT,
    check_out_photo_url TEXT,
    check_out_device_info JSONB,
    check_out_method VARCHAR(20),
    
    -- Working Hours
    scheduled_start_time TIME,
    scheduled_end_time TIME,
    actual_hours_worked INTERVAL,
    break_duration INTERVAL DEFAULT '1 hour',
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    
    -- Status and Validation
    status VARCHAR(20) DEFAULT 'present', -- 'present', 'late', 'absent', 'half_day'
    is_late BOOLEAN DEFAULT false,
    late_minutes INTEGER DEFAULT 0,
    is_early_departure BOOLEAN DEFAULT false,
    early_departure_minutes INTEGER DEFAULT 0,
    
    -- Anomaly Detection
    anomaly_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
    anomaly_reasons JSONB, -- Array of potential issues
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    approval_notes TEXT,
    
    -- System
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(employee_id, date)
);

-- Allowed attendance locations
CREATE TABLE attendance_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    coordinates POINT NOT NULL, -- Center point
    radius_meters INTEGER DEFAULT 100, -- Geofence radius
    wifi_ssids JSONB, -- Array of allowed WiFi networks
    timezone VARCHAR(50) DEFAULT 'Asia/Vientiane',
    working_hours JSONB, -- {monday: {start: "08:00", end: "17:00"}, ...}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance anomaly detection
CREATE TABLE attendance_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_record_id UUID REFERENCES attendance_records(id) NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL, -- 'location', 'time', 'device', 'pattern'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- 0-1 scale
    auto_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES employees(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Leave Management
```sql
-- Leave types
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_lo VARCHAR(100),
    code VARCHAR(20) NOT NULL,
    description TEXT,
    
    -- Entitlement Rules
    annual_entitlement INTEGER, -- Days per year
    max_carry_forward INTEGER DEFAULT 0,
    min_service_months INTEGER DEFAULT 0, -- Minimum service required
    
    -- Accrual Rules
    accrual_method VARCHAR(20) DEFAULT 'annual', -- 'annual', 'monthly', 'none'
    accrual_rate DECIMAL(5,2), -- Days per month if monthly accrual
    
    -- Application Rules
    min_advance_days INTEGER DEFAULT 1,
    max_days_per_request INTEGER,
    requires_attachment BOOLEAN DEFAULT false,
    
    -- Approval Rules
    requires_approval BOOLEAN DEFAULT true,
    approval_levels INTEGER DEFAULT 1,
    auto_approve_threshold INTEGER, -- Auto approve if <= X days
    
    -- Other Settings
    is_paid BOOLEAN DEFAULT true,
    affects_attendance BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Employee leave balances
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
    year INTEGER NOT NULL,
    
    -- Balance Details
    opening_balance DECIMAL(5,2) DEFAULT 0,
    earned_days DECIMAL(5,2) DEFAULT 0,
    used_days DECIMAL(5,2) DEFAULT 0,
    pending_days DECIMAL(5,2) DEFAULT 0, -- Pending approval
    carry_forward DECIMAL(5,2) DEFAULT 0,
    adjustments DECIMAL(5,2) DEFAULT 0,
    current_balance DECIMAL(5,2) GENERATED ALWAYS AS 
        (opening_balance + earned_days + carry_forward + adjustments - used_days - pending_days) STORED,
    
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, leave_type_id, year)
);

-- Leave requests
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
    
    -- Request Details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    attachment_url TEXT,
    emergency_contact JSONB, -- {name, phone, relationship}
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    submitted_at TIMESTAMP DEFAULT NOW(),
    
    -- Approval Chain
    current_approval_level INTEGER DEFAULT 1,
    final_approval_level INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Leave approvals
CREATE TABLE leave_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_request_id UUID REFERENCES leave_requests(id) NOT NULL,
    approver_id UUID REFERENCES employees(id) NOT NULL,
    approval_level INTEGER NOT NULL,
    
    -- Approval Decision
    status VARCHAR(20) NOT NULL, -- 'pending', 'approved', 'rejected'
    comments TEXT,
    approved_at TIMESTAMP,
    
    -- System
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(leave_request_id, approval_level)
);
```

#### 5. Payroll System
```sql
-- Salary grades and structures
CREATE TABLE salary_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    grade_code VARCHAR(10) NOT NULL, -- A1, A2, B1, etc.
    grade_name VARCHAR(100) NOT NULL,
    min_salary DECIMAL(15,2) NOT NULL,
    max_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LAK',
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, grade_code, effective_date)
);

-- Salary components (basic, allowances, deductions)
CREATE TABLE salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    component_code VARCHAR(20) NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    component_name_en VARCHAR(100),
    component_name_lo VARCHAR(100),
    
    -- Component Type
    component_type VARCHAR(20) NOT NULL, -- 'earning', 'deduction'
    component_category VARCHAR(30) NOT NULL, -- 'basic', 'allowance', 'overtime', 'tax', 'insurance'
    
    -- Calculation
    calculation_method VARCHAR(20) NOT NULL, -- 'fixed', 'percentage', 'formula'
    default_value DECIMAL(15,2),
    formula TEXT, -- For complex calculations
    
    -- Rules
    is_taxable BOOLEAN DEFAULT true,
    is_provident_fund_applicable BOOLEAN DEFAULT true,
    affects_overtime BOOLEAN DEFAULT false,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, component_code)
);

-- Employee salary details
CREATE TABLE employee_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    salary_grade_id UUID REFERENCES salary_grades(id),
    
    -- Basic Information
    basic_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LAK',
    effective_date DATE NOT NULL,
    end_date DATE,
    
    -- Bank Details
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_branch VARCHAR(100),
    
    -- Status
    is_current BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES employees(id)
);

-- Employee salary components
CREATE TABLE employee_salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_salary_id UUID REFERENCES employee_salaries(id) NOT NULL,
    salary_component_id UUID REFERENCES salary_components(id) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,2), -- If percentage-based
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL,
    end_date DATE
);

-- Payroll periods
CREATE TABLE payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    period_name VARCHAR(50) NOT NULL, -- "January 2024", "2024-01"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'processing', 'completed', 'approved'
    is_bonus_period BOOLEAN DEFAULT false,
    
    -- Totals
    total_employees INTEGER DEFAULT 0,
    total_gross_pay DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    total_net_pay DECIMAL(15,2) DEFAULT 0,
    
    -- Processing
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES employees(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, start_date, end_date)
);

-- Individual payroll records
CREATE TABLE payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID REFERENCES payroll_periods(id) NOT NULL,
    employee_id UUID REFERENCES employees(id) NOT NULL,
    
    -- Working Days
    total_working_days INTEGER NOT NULL,
    actual_working_days DECIMAL(5,2) NOT NULL,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    leave_days DECIMAL(5,2) DEFAULT 0,
    
    -- Salary Calculation
    basic_salary DECIMAL(15,2) NOT NULL,
    gross_earnings DECIMAL(15,2) NOT NULL,
    total_deductions DECIMAL(15,2) NOT NULL,
    net_salary DECIMAL(15,2) NOT NULL,
    
    -- Detailed Breakdown (JSON)
    earnings_breakdown JSONB, -- {basic: 1000000, allowance: 200000, overtime: 150000}
    deductions_breakdown JSONB, -- {tax: 50000, insurance: 30000, loan: 100000}
    
    -- Tax Information
    taxable_income DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'calculated', 'approved', 'paid'
    
    -- Payment
    payment_method VARCHAR(20) DEFAULT 'bank_transfer', -- 'cash', 'bank_transfer', 'check'
    payment_reference VARCHAR(100),
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(payroll_period_id, employee_id)
);

-- Tax settings for Laos
CREATE TABLE tax_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    tax_year INTEGER NOT NULL,
    
    -- Personal Income Tax Brackets (Laos)
    tax_brackets JSONB NOT NULL, -- [{min: 0, max: 1200000, rate: 0}, {min: 1200001, max: 2400000, rate: 0.05}]
    
    -- Deductions
    personal_allowance DECIMAL(15,2) DEFAULT 1200000, -- 1.2M LAK personal allowance
    spouse_allowance DECIMAL(15,2) DEFAULT 600000,
    child_allowance DECIMAL(15,2) DEFAULT 300000,
    
    -- Social Security
    social_security_rate_employee DECIMAL(5,2) DEFAULT 4.5,
    social_security_rate_employer DECIMAL(5,2) DEFAULT 6.0,
    social_security_max_salary DECIMAL(15,2),
    
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, tax_year)
);
```

#### 6. Performance Management
```sql
-- Performance review cycles
CREATE TABLE performance_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    cycle_name VARCHAR(100) NOT NULL, -- "2024 Annual Review", "Q1 2024"
    cycle_type VARCHAR(20) NOT NULL, -- 'annual', 'quarterly', 'monthly', 'project'
    
    -- Timeline
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(performance_cycle_id, employee_id, reviewer_id, review_type)
);

-- Performance review ratings (detailed breakdown)
CREATE TABLE performance_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_review_id UUID REFERENCES performance_reviews(id) NOT NULL,
    performance_criteria_id UUID REFERENCES performance_criteria(id) NOT NULL,
    rating DECIMAL(3,1) NOT NULL,
    comments TEXT,
    evidence TEXT, -- Supporting evidence/examples
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance goals
CREATE TABLE performance_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    performance_cycle_id UUID REFERENCES performance_cycles(id),
    
    -- Goal Details
    goal_title VARCHAR(255) NOT NULL,
    goal_description TEXT NOT NULL,
    goal_category VARCHAR(50), -- 'individual', 'team', 'company'
    
    -- Measurement
    target_value DECIMAL(10,2),
    unit VARCHAR(50), -- 'percentage', 'amount', 'count', 'days'
    measurement_method TEXT,
    
    -- Timeline
    start_date DATE,
    target_date DATE,
    
    -- Progress
    current_value DECIMAL(10,2) DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'draft', 'active', 'completed', 'cancelled'
    
    -- Approval
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. Recruitment System
```sql
-- Job positions/openings
CREATE TABLE job_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    department_id UUID REFERENCES departments(id) NOT NULL,
    position_id UUID REFERENCES positions(id) NOT NULL,
    
    -- Job Details
    job_title VARCHAR(255) NOT NULL,
    job_code VARCHAR(50) UNIQUE NOT NULL,
    job_description TEXT NOT NULL,
    job_requirements TEXT NOT NULL,
    
    -- Employment Details
    employment_type VARCHAR(20) NOT NULL, -- 'permanent', 'contract', 'internship'
    work_location VARCHAR(255),
    reporting_manager_id UUID REFERENCES employees(id),
    
    -- Compensation
    salary_min DECIMAL(15,2),
    salary_max DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'LAK',
    benefits TEXT,
    
    -- Vacancy Details
    positions_available INTEGER DEFAULT 1,
    application_deadline DATE,
    expected_start_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'closed', 'cancelled'
    is_internal_only BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    
    -- Publishing
    published_at TIMESTAMP,
    published_by UUID REFERENCES employees(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job applications
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_position_id UUID REFERENCES job_positions(id) NOT NULL,
    
    -- Applicant Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    
    -- Address
    address JSONB,
    
    -- Professional Information
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    total_experience_years INTEGER,
    relevant_experience_years INTEGER,
    current_salary DECIMAL(15,2),
    expected_salary DECIMAL(15,2),
    notice_period_days INTEGER,
    
    -- Documents
    resume_url TEXT,
    cover_letter_url TEXT,
    portfolio_url TEXT,
    other_documents JSONB, -- Array of document URLs
    
    -- Application Status
    status VARCHAR(20) DEFAULT 'received', -- 'received', 'screening', 'interview', 'offer', 'hired', 'rejected'
    source VARCHAR(50), -- 'website', 'referral', 'linkedin', 'facebook'
    referrer_employee_id UUID REFERENCES employees(id),
    
    -- Screening
    screening_score INTEGER, -- 0-100
    screening_notes TEXT,
    screened_by UUID REFERENCES employees(id),
    screened_at TIMESTAMP,
    
    -- Notes and Feedback
    hr_notes TEXT,
    interview_feedback TEXT,
    rejection_reason TEXT,
    
    applied_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(job_position_id, email)
);

-- Interview schedules
CREATE TABLE interview_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_application_id UUID REFERENCES job_applications(id) NOT NULL,
    
    -- Interview Details
    interview_type VARCHAR(20) NOT NULL, -- 'phone', 'video', 'in_person', 'technical'
    interview_round INTEGER DEFAULT 1,
    
    -- Scheduling
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT, -- Physical location or video link
    
    -- Participants
    interviewers JSONB NOT NULL, -- Array of employee IDs
    interview_panel_lead UUID REFERENCES employees(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'rescheduled'
    
    -- Results
    overall_rating INTEGER, -- 1-10
    technical_rating INTEGER,
    communication_rating INTEGER,
    cultural_fit_rating INTEGER,
    recommendation VARCHAR(20), -- 'hire', 'reject', 'next_round'
    feedback TEXT,
    
    -- System
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    scheduled_by UUID REFERENCES employees(id)
);

-- Recruitment pipeline tracking
CREATE TABLE recruitment_pipeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_application_id UUID REFERENCES job_applications(id) NOT NULL,
    stage VARCHAR(30) NOT NULL, -- 'application', 'screening', 'interview_1', 'interview_2', 'offer', 'hired'
    status VARCHAR(20) NOT NULL, -- 'in_progress', 'passed', 'failed', 'on_hold'
    
    -- Timeline
    entered_at TIMESTAMP DEFAULT NOW(),
    exited_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    next_action TEXT,
    responsible_person_id UUID REFERENCES employees(id),
    
    created_by UUID REFERENCES employees(id)
);
```

#### 8. Training Management
```sql
-- Training programs
CREATE TABLE training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    
    -- Program Details
    program_name VARCHAR(255) NOT NULL,
    program_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    objectives TEXT,
    
    -- Categorization
    category VARCHAR(50) NOT NULL, -- 'technical', 'soft_skills', 'compliance', 'leadership'
    skill_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    
    -- Content
    curriculum TEXT,
    prerequisites TEXT,
    
    -- Delivery
    delivery_method VARCHAR(20) NOT NULL, -- 'in_person', 'online', 'hybrid', 'self_paced'
    duration_hours INTEGER,
    max_participants INTEGER,
    
    -- Certification
    provides_certificate BOOLEAN DEFAULT false,
    certificate_validity_months INTEGER,
    
    -- Costs
    cost_per_participant DECIMAL(15,2),
    external_provider VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_mandatory BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES employees(id)
);

-- Training sessions (specific instances)
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_program_id UUID REFERENCES training_programs(id) NOT NULL,
    
    -- Session Details
    session_name VARCHAR(255) NOT NULL,
    session_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Scheduling
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    
    -- Location
    venue VARCHAR(255),
    room VARCHAR(100),
    online_link TEXT,
    
    -- Capacity
    max_participants INTEGER NOT NULL,
    min_participants INTEGER DEFAULT 1,
    
    -- Instructor
    instructor_internal_id UUID REFERENCES employees(id),
    instructor_external VARCHAR(255),
    instructor_contact JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    
    -- Results
    completion_rate DECIMAL(5,2),
    average_rating DECIMAL(3,1),
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES employees(id)
);

-- Training enrollments
CREATE TABLE training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_session_id UUID REFERENCES training_sessions(id) NOT NULL,
    employee_id UUID REFERENCES employees(id) NOT NULL,
    
    -- Enrollment Details
    enrollment_type VARCHAR(20) DEFAULT 'voluntary', -- 'mandatory', 'voluntary', 'assigned'
    enrolled_by UUID REFERENCES employees(id),
    enrollment_date TIMESTAMP DEFAULT NOW(),
    
    -- Status
    status VARCHAR(20) DEFAULT 'enrolled', -- 'enrolled', 'attending', 'completed', 'cancelled', 'no_show'
    
    -- Attendance
    attendance_percentage DECIMAL(5,2),
    attended_sessions INTEGER DEFAULT 0,
    total_sessions INTEGER,
    
    -- Assessment
    pre_assessment_score DECIMAL(5,2),
    post_assessment_score DECIMAL(5,2),
    final_score DECIMAL(5,2),
    
    -- Completion
    completed_at TIMESTAMP,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    
    -- Feedback
    participant_rating INTEGER, -- 1-5
    participant_feedback TEXT,
    instructor_notes TEXT,
    
    UNIQUE(training_session_id, employee_id)
);

-- Training certificates
CREATE TABLE training_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_enrollment_id UUID REFERENCES training_enrollments(id) NOT NULL,
    employee_id UUID REFERENCES employees(id) NOT NULL,
    training_program_id UUID REFERENCES training_programs(id) NOT NULL,
    
    -- Certificate Details
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Digital Certificate
    certificate_url TEXT,
    certificate_hash VARCHAR(255), -- For verification
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'revoked'
    
    issued_by UUID REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. System & Audit Tables
```sql
-- Comprehensive audit log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Details
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    
    -- User Context
    user_id UUID REFERENCES auth.users(id),
    employee_id UUID REFERENCES employees(id),
    session_id VARCHAR(255),
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    request_url TEXT,
    
    -- Data Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields JSONB, -- Array of changed field names
    
    -- Additional Context
    reason TEXT,
    notes TEXT,
    
    -- Timestamp
    timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Indexing for performance
    INDEX idx_audit_logs_table_record (table_name, record_id),
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_timestamp (timestamp DESC)
);

-- System notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    recipient_id UUID REFERENCES employees(id) NOT NULL,
    recipient_type VARCHAR(20) DEFAULT 'employee', -- 'employee', 'role', 'department'
    
    -- Notification Details
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL, -- 'leave_request', 'payroll', 'attendance', 'performance'
    priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Related Entity
    related_table VARCHAR(100),
    related_id UUID,
    
    -- Action Required
    action_required BOOLEAN DEFAULT false,
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Delivery
    delivery_channels JSONB, -- ['email', 'push', 'whatsapp']
    email_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    whatsapp_sent BOOLEAN DEFAULT false,
    
    -- Expiry
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_notifications_recipient (recipient_id, is_read),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_created (created_at DESC)
);

-- System settings and configurations
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    
    -- Setting Details
    setting_category VARCHAR(50) NOT NULL, -- 'general', 'attendance', 'payroll', 'leave'
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    
    -- Metadata
    description TEXT,
    data_type VARCHAR(20) NOT NULL, -- 'string', 'number', 'boolean', 'json', 'date'
    is_encrypted BOOLEAN DEFAULT false,
    
    -- Validation
    validation_rules JSONB, -- {required: true, min: 0, max: 100}
    
    -- Access Control
    is_public BOOLEAN DEFAULT false,
    requires_admin BOOLEAN DEFAULT true,
    
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES employees(id),
    
    UNIQUE(organization_id, setting_category, setting_key)
);

-- Multi-language content
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Translation Key
    translation_key VARCHAR(255) NOT NULL,
    locale VARCHAR(10) NOT NULL, -- 'en', 'lo', 'th'
    
    -- Content
    content TEXT NOT NULL,
    
    -- Context
    context VARCHAR(100), -- 'ui', 'email', 'report'
    
    -- Metadata
    is_approved BOOLEAN DEFAULT false,
    translated_by UUID REFERENCES employees(id),
    approved_by UUID REFERENCES employees(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(translation_key, locale)
);
```

---

## 🔐 Security Architecture

### Authentication & Authorization Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Login    │    │   Firebase      │    │   Application   │
│                 │    │   Auth          │    │   Logic         │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Email/Pass   │───►│ 2. Verify Creds │    │                 │
│ 2. 2FA Code     │    │ 3. Generate JWT │    │                 │
│ 3. Device Check │    │ 4. RLS Policies │◄───│ 5. API Calls    │
│                 │◄───│ 5. Session      │    │ 6. Data Access  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Row Level Security (RLS) Policies
```sql
-- Employees can only see their own data or if they're HR/Manager
CREATE POLICY "employees_select_policy" ON employees
FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('hr_admin', 'hr_manager')
    ) OR
    EXISTS (
        SELECT 1 FROM employees e
        WHERE e.user_id = auth.uid()
        AND (e.id = employees.direct_manager_id OR e.department_id = employees.department_id)
    )
);

-- Payroll data - highly restricted
CREATE POLICY "payroll_records_select_policy" ON payroll_records
FOR SELECT USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('payroll_admin', 'hr_admin')
    )
);

-- Attendance records - employee or their manager
CREATE POLICY "attendance_records_policy" ON attendance_records
FOR ALL USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
    ) OR
    employee_id IN (
        SELECT e.id FROM employees e
        JOIN employees m ON m.id = e.direct_manager_id
        WHERE m.user_id = auth.uid()
    )
);
```

### Data Encryption Strategy
```
Encryption Levels:
├── Database Level (Firebase)
│   ├── TLS 1.3 in transit
│   ├── AES-256 at rest
│   └── Backup encryption
├── Application Level
│   ├── Salary data (AES-256)
│   ├── Personal IDs (AES-256)
│   ├── Bank details (AES-256)
│   └── Medical records (AES-256)
└── File Storage
    ├── Documents (Server-side encryption)
    ├── Photos (Client-side hash)
    └── Certificates (Digital signature)
```

### Role-Based Access Control (RBAC)
```sql
-- User roles hierarchy
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    granted_by UUID REFERENCES employees(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_name)
);

-- Permission definitions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL, -- 'employees', 'payroll', 'attendance'
    action VARCHAR(20) NOT NULL, -- 'create', 'read', 'update', 'delete'
    description TEXT
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    role_name VARCHAR(50) NOT NULL,
    permission_id UUID REFERENCES permissions(id) NOT NULL,
    PRIMARY KEY (role_name, permission_id)
);
```

---

## 📱 Anti-Fraud Attendance System

### Multi-Layer Verification
```
Check-in Process:
├── Layer 1: Location Verification
│   ├── GPS Coordinates (±50m accuracy)
│   ├── Geofence validation
│   └── Address reverse lookup
├── Layer 2: Network Verification
│   ├── WiFi SSID matching
│   ├── IP address ranges
│   └── Network fingerprinting
├── Layer 3: Biometric Verification
│   ├── Face recognition (TensorFlow.js)
│   ├── Photo comparison with employee profile
│   └── Liveness detection
├── Layer 4: Device Verification
│   ├── Device fingerprinting
│   ├── Registered device check
│   └── Browser/app verification
└── Layer 5: Behavioral Analysis
    ├── Time pattern analysis
    ├── Location consistency
    └── Anomaly scoring
```

### Anomaly Detection Algorithm
```typescript
// Pseudocode for anomaly detection
interface AttendanceAnomaly {
  score: number; // 0-1 (1 = definitely fraud)
  factors: AnomalyFactor[];
}

interface AnomalyFactor {
  type: 'location' | 'time' | 'device' | 'pattern';
  weight: number;
  description: string;
}

function detectAnomalies(record: AttendanceRecord): AttendanceAnomaly {
  const factors: AnomalyFactor[] = [];
  
  // Location-based detection
  if (distanceFromOffice > 500) {
    factors.push({
      type: 'location',
      weight: 0.8,
      description: 'Check-in location too far from office'
    });
  }
  
  // Time-based detection
  if (isWeekend || isHoliday) {
    factors.push({
      type: 'time',
      weight: 0.6,
      description: 'Check-in on non-working day'
    });
  }
  
  // Pattern-based detection
  const avgCheckInTime = getEmployeeAverageCheckIn(employeeId);
  if (Math.abs(currentTime - avgCheckInTime) > 120) { // 2 hours difference
    factors.push({
      type: 'pattern',
      weight: 0.4,
      description: 'Unusual check-in time pattern'
    });
  }
  
  // Device-based detection
  if (!isRegisteredDevice(deviceFingerprint)) {
    factors.push({
      type: 'device',
      weight: 0.7,
      description: 'Unregistered device used'
    });
  }
  
  const totalScore = factors.reduce((sum, f) => sum + f.weight, 0) / factors.length;
  
  return {
    score: Math.min(totalScore, 1),
    factors
  };
}
```

### Location Tracking Implementation
```typescript
// GPS and WiFi-based location verification
interface LocationVerification {
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
  wifi: {
    ssid: string;
    bssid: string;
    strength: number;
  }[];
  address: {
    formatted: string;
    components: AddressComponent[];
  };
  verification: {
    isValid: boolean;
    confidence: number;
    distance: number; // meters from allowed location
  };
}

async function verifyLocation(
  gps: GPSCoords,
  wifiNetworks: WiFiNetwork[],
  allowedLocations: AttendanceLocation[]
): Promise<LocationVerification> {
  // Implementation details for location verification
}
```

---

## 🌐 API Structure

### RESTful API Endpoints
```
Authentication:
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

Employee Management:
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/employees/:id/org-chart
GET    /api/employees/:id/documents

Attendance:
POST   /api/attendance/check-in
POST   /api/attendance/check-out
GET    /api/attendance/records
GET    /api/attendance/records/:employeeId
POST   /api/attendance/manual-entry
GET    /api/attendance/anomalies

Leave Management:
GET    /api/leave/types
GET    /api/leave/balances/:employeeId
POST   /api/leave/requests
GET    /api/leave/requests
PUT    /api/leave/requests/:id/approve
PUT    /api/leave/requests/:id/reject

Payroll:
GET    /api/payroll/periods
POST   /api/payroll/calculate
GET    /api/payroll/records/:periodId
GET    /api/payroll/records/:periodId/:employeeId
POST   /api/payroll/approve

Performance:
GET    /api/performance/cycles
POST   /api/performance/reviews
GET    /api/performance/reviews/:id
PUT    /api/performance/reviews/:id
GET    /api/performance/goals/:employeeId

Recruitment:
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:id/applications
POST   /api/applications
PUT    /api/applications/:id/status

Training:
GET    /api/training/programs
POST   /api/training/sessions
POST   /api/training/enrollments
GET    /api/training/certificates/:employeeId

Reports:
GET    /api/reports/attendance
GET    /api/reports/payroll
GET    /api/reports/performance
GET    /api/reports/custom

System:
GET    /api/settings
PUT    /api/settings
GET    /api/notifications
PUT    /api/notifications/:id/read
GET    /api/audit-logs
```

### GraphQL Schema (Alternative)
```graphql
type Employee {
  id: ID!
  employeeNumber: String!
  firstName: String!
  lastName: String!
  email: String!
  department: Department!
  position: Position!
  manager: Employee
  directReports: [Employee!]!
  attendanceRecords: [AttendanceRecord!]!
  leaveBalances: [LeaveBalance!]!
  performanceReviews: [PerformanceReview!]!
}

type AttendanceRecord {
  id: ID!
  employee: Employee!
  date: Date!
  checkInTime: DateTime
  checkOutTime: DateTime
  location: Location!
  status: AttendanceStatus!
  anomalyScore: Float!
}

type Query {
  employees(filter: EmployeeFilter): [Employee!]!
  employee(id: ID!): Employee
  attendanceRecords(filter: AttendanceFilter): [AttendanceRecord!]!
  payrollRecords(periodId: ID!): [PayrollRecord!]!
}

type Mutation {
  createEmployee(input: CreateEmployeeInput!): Employee!
  checkIn(input: CheckInInput!): AttendanceRecord!
  submitLeaveRequest(input: LeaveRequestInput!): LeaveRequest!
  approveLeaveRequest(id: ID!): LeaveRequest!
}
```

---

## 🎨 User Interface Structure

### Application Layout
```
Main Application Layout:
├── Header/Navigation
│   ├── Company Logo
│   ├── Main Navigation Menu
│   ├── Language Selector (Lo/En/Th)
│   ├── Notification Bell
│   └── User Profile Dropdown
├── Sidebar (Collapsible)
│   ├── Dashboard
│   ├── Employee Management
│   ├── Attendance & Time
│   ├── Leave Management
│   ├── Payroll
│   ├── Performance
│   ├── Recruitment
│   ├── Training
│   ├── Reports
│   └── Settings
├── Main Content Area
│   ├── Breadcrumb Navigation
│   ├── Page Title & Actions
│   ├── Content Body
│   └── Floating Action Button (Mobile)
└── Footer
    ├── Copyright
    ├── Version Info
    └── Support Links
```

### Mobile-First Design Strategy
```
Responsive Breakpoints:
├── Mobile: 320px - 767px
│   ├── Single column layout
│   ├── Collapsible navigation
│   ├── Touch-optimized controls
│   └── Gesture support
├── Tablet: 768px - 1023px
│   ├── Two-column layout
│   ├── Sidebar overlay
│   └── Mixed touch/mouse
└── Desktop: 1024px+
    ├── Full sidebar
    ├── Multi-column layout
    └── Advanced interactions
```

### Component Library Structure
```
UI Components:
├── Base Components
│   ├── Button, Input, Select
│   ├── Modal, Dialog, Drawer
│   ├── Table, Card, Badge
│   └── Loading, Error, Empty States
├── Form Components
│   ├── FormField, FormGroup
│   ├── DatePicker, TimePicker
│   ├── FileUpload, ImageCrop
│   └── ValidationMessage
├── Data Display
│   ├── DataTable, DataGrid
│   ├── Charts, Graphs
│   ├── Timeline, Calendar
│   └── Statistics Cards
├── Navigation
│   ├── Navbar, Sidebar
│   ├── Breadcrumbs, Tabs
│   ├── Pagination, Steps
│   └── Menu, Dropdown
└── Layout
    ├── Container, Grid
    ├── Flex, Stack
    ├── Spacer, Divider
    └── Responsive Wrappers
```

### Page Structure Examples
```
Dashboard Page:
├── Welcome Section
│   ├── User greeting
│   ├── Current date/time
│   └── Quick actions
├── Statistics Overview
│   ├── Employee count
│   ├── Attendance rate
│   ├── Leave requests pending
│   └── Payroll status
├── Recent Activities
│   ├── Timeline of recent actions
│   ├── Notifications
│   └── Upcoming events
├── Quick Links
│   ├── Clock in/out
│   ├── Request leave
│   ├── View payslip
│   └── Update profile
└── Charts & Analytics
    ├── Attendance trends
    ├── Department overview
    └── Performance metrics

Employee Profile Page:
├── Profile Header
│   ├── Photo, Name, Title
│   ├── Employee number
│   ├── Department, Manager
│   └── Contact information
├── Tabbed Content
│   ├── Personal Information
│   ├── Employment Details
│   ├── Documents
│   ├── Performance History
│   ├── Training Records
│   └── Attendance Summary
└── Action Buttons
    ├── Edit Profile
    ├── View Org Chart
    ├── Download Reports
    └── Contact Employee
```

---

## 🚀 Deployment Architecture

### Cloud Infrastructure
```
Production Environment:
├── Frontend (Vercel)
│   ├── Next.js App
│   ├── Static Assets
│   ├── Edge Functions
│   └── CDN Distribution
├── Backend (Firebase Cloud)
│   ├── PostgreSQL Database
│   ├── Authentication Service
│   ├── File Storage
│   ├── Real-time Engine
│   └── Edge Functions
├── Third-party Services
│   ├── Google Maps API (Location)
│   ├── Firebase FCM (Push Notifications)
│   ├── WhatsApp Business API
│   ├── Email Service (SendGrid/Mailgun)
│   └── SMS Gateway (Twilio)
└── Monitoring & Analytics
    ├── Vercel Analytics
    ├── Firebase Insights
    ├── Error Tracking (Sentry)
    └── Performance Monitoring
```

### Environment Configuration
```
Development Environment:
├── Local Development
│   ├── Node.js 18+
│   ├── Next.js Dev Server
│   ├── Firebase Local (Docker)
│   └── Git Version Control
├── Testing Environment
│   ├── Automated Testing (Jest/Cypress)
│   ├── Database Migrations
│   ├── Seed Data
│   └── CI/CD Pipeline (GitHub Actions)
└── Staging Environment
    ├── Preview Deployments (Vercel)
    ├── Staging Database
    ├── Integration Testing
    └── User Acceptance Testing
```

### CI/CD Pipeline
```yaml
# GitHub Actions Workflow
name: Deploy HR System

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run build
      - run: npm run e2e-test

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Run Database Migrations
        run: npx firebase db push
```

### Security & Backup Strategy
```
Security Measures:
├── SSL/TLS Certificates (Auto-renewal)
├── Environment Variables (Encrypted)
├── API Rate Limiting
├── DDoS Protection (Cloudflare)
├── Web Application Firewall
├── Security Headers (HSTS, CSP)
└── Regular Security Audits

Backup Strategy:
├── Database Backups
│   ├── Daily automated backups
│   ├── Point-in-time recovery
│   ├── Cross-region replication
│   └── Backup encryption
├── File Storage Backups
│   ├── Document versioning
│   ├── Redundant storage
│   └── Disaster recovery
└── Application Backups
    ├── Code repository (Git)
    ├── Configuration backups
    └── Infrastructure as Code
```

---

## 📈 Development Phases

### Phase 1: Foundation & Core Features (MVP) - 2-3 Months

#### Week 1-2: Project Setup & Infrastructure
- [ ] **Environment Setup**
  - Set up development environment
  - Create Firebase project
  - Configure Next.js application
  - Set up version control (Git)
  - Configure CI/CD pipeline

- [ ] **Database Foundation**
  - Create core database schema
  - Set up authentication tables
  - Implement Row Level Security policies
  - Create initial seed data
  - Set up database migrations

#### Week 3-4: Authentication & User Management
- [ ] **Authentication System**
  - Implement login/logout functionality
  - Set up password reset flow
  - Configure 2FA (Two-Factor Authentication)
  - Create user registration process
  - Implement session management

- [ ] **Basic User Interface**
  - Create main layout components
  - Implement responsive navigation
  - Set up internationalization (i18n)
  - Create loading and error states
  - Design system setup (Tailwind + ShadCN)

#### Week 5-6: Employee Management
- [ ] **Employee CRUD Operations**
  - Employee registration form
  - Employee profile management
  - Organization structure setup
  - Department and position management
  - Employee search and filtering

- [ ] **Organization Hierarchy**
  - Org chart visualization
  - Manager-employee relationships
  - Department structure
  - Role-based access control
  - Employee directory

#### Week 7-8: Attendance System (Core)
- [ ] **Basic Attendance**
  - Check-in/check-out functionality
  - GPS location capture
  - Attendance history view
  - Manual attendance entry
  - Attendance location setup

- [ ] **Anti-Fraud Foundation**
  - Location verification (GPS)
  - Device fingerprinting
  - Photo capture during check-in
  - Basic anomaly detection
  - Attendance validation rules

#### Week 9-10: Leave Management
- [ ] **Leave System**
  - Leave type configuration
  - Leave balance calculation
  - Leave request submission
  - Approval workflow
  - Leave calendar view

- [ ] **Leave Processing**
  - Manager approval interface
  - Email notifications
  - Leave balance updates
  - Leave history tracking
  - Holiday calendar integration

#### Week 11-12: Basic Reporting & Testing
- [ ] **Core Reports**
  - Attendance reports
  - Leave reports
  - Employee reports
  - Dashboard analytics
  - Export functionality (PDF/Excel)

- [ ] **Testing & Deployment**
  - Unit testing implementation
  - Integration testing
  - User acceptance testing
  - Performance optimization
  - Production deployment

### Phase 2: Advanced Features - 1-2 Months

#### Week 13-14: Payroll System
- [ ] **Payroll Foundation**
  - Salary structure setup
  - Tax calculation (Laos law)
  - Payroll period management
  - Salary component configuration
  - Social security integration

- [ ] **Payroll Processing**
  - Payroll calculation engine
  - Payslip generation
  - Bank file export
  - Payroll approval workflow
  - Tax report generation

#### Week 15-16: Performance Management
- [ ] **Performance System**
  - Performance cycle setup
  - Review templates creation
  - Goal setting functionality
  - Performance rating system
  - 360-degree feedback

- [ ] **Performance Analytics**
  - Performance dashboards
  - Goal tracking
  - Performance trends
  - Calibration tools
  - Performance reports

#### Week 17-18: Recruitment Module
- [ ] **Job Management**
  - Job posting creation
  - Application management
  - Resume parsing
  - Interview scheduling
  - Candidate pipeline tracking

- [ ] **Recruitment Analytics**
  - Recruitment metrics
  - Hiring pipeline reports
  - Time-to-hire analysis
  - Source effectiveness
  - Interview feedback system

### Phase 3: Enhancement & Optimization - 1 Month

#### Week 19-20: Training Management
- [ ] **Training System**
  - Training program management
  - Course catalog
  - Enrollment management
  - Training calendar
  - Certificate management

- [ ] **Learning Analytics**
  - Training effectiveness metrics
  - Skill gap analysis
  - Training ROI calculation
  - Learning path recommendations
  - Compliance tracking

#### Week 21-22: Advanced Analytics & Mobile Optimization
- [ ] **Business Intelligence**
  - Advanced dashboard creation
  - Predictive analytics
  - Custom report builder
  - Data visualization enhancements
  - KPI monitoring

- [ ] **Mobile Enhancement**
  - Progressive Web App (PWA) setup
  - Offline functionality
  - Push notifications
  - Mobile-specific features
  - Performance optimization

#### Week 23-24: Integration & Final Testing
- [ ] **System Integration**
  - WhatsApp Business API integration
  - Government system integration
  - Third-party API integrations
  - Data import/export tools
  - API documentation

- [ ] **Final Testing & Launch**
  - Comprehensive testing
  - Performance optimization
  - Security audit
  - User training
  - Go-live preparation

---

## 💰 Cost Analysis

### Development Costs

#### Software & Tools (Monthly)
```
Essential Tools:
├── Firebase Pro Plan: $25/month
├── Vercel Pro Plan: $20/month (optional)
├── Domain & SSL: $2/month
├── Google Maps API: $10-50/month (usage-based)
├── Email Service: $10-30/month
├── SMS/WhatsApp API: $20-100/month
└── Monitoring Tools: $10-50/month

Total Software: $97-277/month (~$100-300/month)
```

#### Third-party Services (As needed)
```
Optional Services:
├── Error Tracking (Sentry): $26/month
├── Analytics (Mixpanel): $25/month
├── Backup Services: $10/month
├── Security Scanning: $20/month
└── Performance Monitoring: $30/month

Total Optional: $111/month
```

### Operational Costs

#### Infrastructure Scaling
```
User Scale Projection:
├── 200 Users (Current): $25-50/month
├── 500 Users (Year 1): $50-100/month
├── 1000 Users (Year 2): $100-200/month
└── 2000 Users (Year 3): $200-400/month

Storage Growth:
├── Documents: 10GB/year
├── Photos: 5GB/year
├── Backups: 2x storage
└── Total: ~20GB/year growth
```

#### Maintenance & Support
```
Annual Costs:
├── Security Updates: $500/year
├── Feature Updates: $1000/year
├── Performance Optimization: $500/year
├── Third-party Updates: $300/year
└── Training & Documentation: $200/year

Total Maintenance: $2500/year (~$200/month)
```

### Total Cost of Ownership (3 Years)

#### Year 1: Development + Operation
```
Development Phase:
├── Software/Tools: $1200-3600
├── API Usage: $600-2400
└── Development Setup: $500

Operations (Post-launch):
├── Infrastructure: $600-1200
├── Maintenance: $1000
└── Support: $500

Year 1 Total: $3900-8700
```

#### Year 2-3: Operation + Enhancement
```
Annual Operations:
├── Infrastructure: $1200-2400/year
├── Maintenance: $2500/year
├── Feature Enhancements: $1000/year
└── Compliance Updates: $500/year

Year 2-3 Total: $5200-6400/year each
```

### ROI Analysis

#### Cost Comparison
```
HR System Options:
├── Custom Development: $3900-8700 (Year 1)
├── SaaS Solutions: $12,000-36,000/year (200 users)
├── Enterprise Software: $50,000-200,000 (setup + license)
└── Manual Processes: $20,000-50,000/year (staff time)

Savings with Custom Solution:
├── vs SaaS: $8,000-30,000/year savings
├── vs Enterprise: $45,000-195,000 savings
└── vs Manual: $15,000-45,000/year savings
```

#### Break-even Analysis
```
Development Investment: $3900-8700
Monthly Savings vs SaaS: $1000-3000

Break-even Timeline: 1.3-8.7 months
3-Year Total Savings: $24,000-90,000
```

---

## 🎯 Success Metrics & KPIs

### Technical Metrics
```
Performance KPIs:
├── Page Load Time: <2 seconds
├── API Response Time: <500ms
├── Database Query Time: <100ms
├── Uptime: >99.5%
├── Error Rate: <0.1%
└── Mobile Performance Score: >90

User Experience KPIs:
├── User Adoption Rate: >80%
├── Feature Usage Rate: >60%
├── Mobile Usage: >70%
├── Support Tickets: <5/month
└── User Satisfaction: >4.5/5
```

### Business Metrics
```
HR Efficiency KPIs:
├── Attendance Processing Time: -80%
├── Leave Approval Time: -70%
├── Payroll Processing Time: -60%
├── Report Generation Time: -90%
├── Data Accuracy: >99%
└── Compliance Score: 100%

Cost Efficiency KPIs:
├── HR Admin Time Savings: 20+ hours/week
├── Paper Usage Reduction: 90%
├── Manual Error Reduction: 95%
├── Report Generation Cost: -80%
└── Total HR Cost Reduction: 30-50%
```

### User Adoption Metrics
```
Adoption Timeline:
├── Week 1: 20% active users
├── Month 1: 60% active users
├── Month 3: 80% active users
├── Month 6: 95% active users
└── Year 1: Full adoption

Feature Adoption:
├── Employee Self-Service: 90%
├── Mobile Check-in: 80%
├── Leave Requests: 95%
├── Document Access: 70%
└── Performance Reviews: 85%
```

---

## 🔄 Maintenance & Support Strategy

### Regular Maintenance Tasks
```
Daily Tasks:
├── System health monitoring
├── Error log review
├── Performance metrics check
├── Backup verification
└── Security alert monitoring

Weekly Tasks:
├── Database optimization
├── Performance analysis
├── User feedback review
├── Feature usage analytics
└── Security scan

Monthly Tasks:
├── Dependency updates
├── Security patch review
├── Performance optimization
├── User training sessions
└── Feature planning review

Quarterly Tasks:
├── Major updates deployment
├── Security audit
├── Performance benchmark
├── User satisfaction survey
└── Capacity planning review
```

### Support Structure
```
Support Levels:
├── Level 1: User Support
│   ├── Password resets
│   ├── Basic troubleshooting
│   ├── User training
│   └── FAQ management
├── Level 2: Technical Support
│   ├── Bug investigation
│   ├── Configuration issues
│   ├── Integration problems
│   └── Performance issues
└── Level 3: Development Support
    ├── Major bug fixes
    ├── New feature development
    ├── System architecture changes
    └── Third-party integrations
```

### Disaster Recovery Plan
```
Recovery Procedures:
├── Data Backup Recovery
│   ├── Point-in-time recovery
│   ├── Full database restore
│   ├── File system recovery
│   └── Configuration restore
├── System Failover
│   ├── Automatic failover (Firebase)
│   ├── DNS switching
│   ├── Load balancer redirect
│   └── Service continuity
└── Communication Plan
    ├── User notification system
    ├── Status page updates
    ├── Stakeholder communication
    └── Recovery progress updates
```

---

## 📚 Documentation Strategy

### Technical Documentation
```
Documentation Structure:
├── API Documentation
│   ├── Endpoint specifications
│   ├── Authentication guide
│   ├── Error codes reference
│   └── SDK examples
├── Database Documentation
│   ├── Schema diagrams
│   ├── Table relationships
│   ├── Index strategies
│   └── Migration guides
├── Architecture Documentation
│   ├── System overview
│   ├── Component diagrams
│   ├── Data flow diagrams
│   └── Security architecture
└── Deployment Documentation
    ├── Environment setup
    ├── CI/CD configuration
    ├── Monitoring setup
    └── Troubleshooting guide
```

### User Documentation
```
User Guides:
├── Administrator Guide
│   ├── System configuration
│   ├── User management
│   ├── Report generation
│   └── Troubleshooting
├── Manager Guide
│   ├── Approval workflows
│   ├── Team management
│   ├── Performance reviews
│   └── Reporting tools
├── Employee Guide
│   ├── Getting started
│   ├── Self-service features
│   ├── Mobile app usage
│   └── FAQ section
└── Training Materials
    ├── Video tutorials
    ├── Step-by-step guides
    ├── Best practices
    └── Tips and tricks
```

---

## 🌟 Future Enhancements & Roadmap

### Year 1 Enhancements
```
Q1-Q2 Post-Launch:
├── AI-Powered Features
│   ├── Intelligent leave recommendations
│   ├── Automated attendance anomaly detection
│   ├── Performance prediction models
│   └── Smart document categorization
├── Advanced Analytics
│   ├── Predictive workforce analytics
│   ├── Attrition risk modeling
│   ├── Performance trend analysis
│   └── Custom dashboard builder
└── Integration Expansions
    ├── Government portal integration
    ├── Banking system integration
    ├── Calendar system sync
    └── Social media integration
```

### Year 2-3 Vision
```
Advanced Features:
├── Machine Learning
│   ├── Automated performance insights
│   ├── Fraud detection algorithms
│   ├── Workforce optimization
│   └── Predictive maintenance
├── Regional Expansion
│   ├── Multi-country support
│   ├── Currency conversion
│   ├── Local compliance
│   └── Regional customization
├── Enterprise Features
│   ├── Multi-tenant architecture
│   ├── White-label solution
│   ├── API marketplace
│   └── Plugin ecosystem
└── Innovation Labs
    ├── VR/AR training modules
    ├── Blockchain certificates
    ├── IoT device integration
    └── Voice-activated features
```

---

## 📞 Implementation Support

### Getting Started Checklist
```
Pre-Development:
□ Stakeholder alignment meeting
□ Requirements finalization
□ Technical team briefing
□ Timeline confirmation
□ Budget approval

Development Setup:
□ Development environment setup
□ Firebase project creation
□ GitHub repository setup
□ CI/CD pipeline configuration
□ Testing environment preparation

Go-Live Preparation:
□ User acceptance testing
□ Data migration planning
□ Training material preparation
□ Support process setup
□ Launch communication plan
```

### Contact & Support Information
```
Technical Support:
├── Development Team Lead
├── Database Administrator
├── Security Specialist
└── DevOps Engineer

Business Support:
├── Project Manager
├── Business Analyst
├── Training Coordinator
└── Change Management Specialist

Emergency Contacts:
├── 24/7 System Monitoring
├── Critical Issue Escalation
├── Data Recovery Specialist
└── Security Incident Response
```

---

## 📝 Conclusion

This comprehensive HR Management System architecture document provides a complete blueprint for developing a secure, scalable, and feature-rich HR system specifically tailored for companies in Laos. The system leverages modern technologies like Next.js and Firebase to deliver enterprise-grade functionality while maintaining cost-effectiveness and ease of maintenance.

### Key Advantages:
- **Cost-Effective**: 60-80% cheaper than traditional HR software
- **Scalable**: Grows with your organization
- **Secure**: Enterprise-grade security measures
- **Compliant**: Adheres to Laos labor laws and regulations
- **User-Friendly**: Mobile-first, multilingual interface
- **Maintainable**: Single developer can manage and enhance

### Next Steps:
1. Review and approve this architecture document
2. Set up development environment and tools
3. Begin Phase 1 development with MVP features
4. Conduct regular reviews and adjustments
5. Prepare for user training and system launch

This document serves as the foundation for building a world-class HR system that will streamline operations, improve efficiency, and provide valuable insights for better decision-making in your organization.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    self_review_deadline DATE,
    manager_review_deadline DATE,
    hr_review_deadline DATE,
    
    -- Settings
    self_review_enabled BOOLEAN DEFAULT true,
    peer_review_enabled BOOLEAN DEFAULT false,
    goal_setting_enabled BOOLEAN DEFAULT true,
    rating_scale VARCHAR(20) DEFAULT '1-5', -- '1-5', '1-10', 'grade'
    
    -- Status
    status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'active', 'review', 'completed'
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES employees(id)
);

-- Performance review templates/criteria
CREATE TABLE performance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    criteria_name VARCHAR(100) NOT NULL,
    criteria_name_en VARCHAR(100),
    criteria_name_lo VARCHAR(100),
    description TEXT,
    
    -- Categorization
    category VARCHAR(50) NOT NULL, -- 'job_knowledge', 'quality', 'productivity', 'teamwork'
    weight_percentage DECIMAL(5,2) DEFAULT 0, -- 0-100
    
    -- Rating Guidelines
    rating_guidelines JSONB, -- {1: "Poor", 2: "Below Average", 3: "Average", 4: "Good", 5: "Excellent"}
    
    -- Applicability
    applies_to_positions JSONB, -- Array of position IDs
    applies_to_departments JSONB, -- Array of department IDs
    
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Individual performance reviews
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_cycle_id UUID REFERENCES performance_cycles(id) NOT NULL,
    employee_id UUID REFERENCES employees(id) NOT NULL,
    reviewer_id UUID REFERENCES employees(id) NOT NULL,
    review_type VARCHAR(20) NOT NULL, -- 'self', 'manager', 'peer', 'hr'
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'completed'
    
    -- Overall Rating
    overall_rating DECIMAL(3,1), -- e.g., 4.2 out of 5
    overall_comments TEXT,
    
    -- Recommendations
    promotion_recommendation BOOLEAN DEFAULT false,
    salary_increase_recommendation DECIMAL(5,2), -- Percentage
    training_recommendations TEXT,
    
    -- Timeline
    