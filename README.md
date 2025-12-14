# CardioSmart Screening Platform

A web-based screening tool for cardiovascular risk in recreational runners and endurance athletes. Built as a WordPress integration, CardioSmart collects health data via a responsive HTML/JavaScript form, automatically classifies risk, stores results in a MySQL database, and emails participants their screening summary.

---

## 🚀 Features

- **User flow**  
  1. **Registration popup**: First-time visitors see a modal prompting account creation.  
  2. **Informed consent overlay**: Requires acceptance before any data is collected.  
  3. **Health screening form**: Collapsible sections for medical history, symptoms, family history, training background, and clinical measurements.  
  4. **Real-time risk classification**: Uses configurable thresholds (BP, HR, NT-proBNP, ECG intervals, weight, anamnesis) to assign a green/yellow/red signal.  
  5. **Interactive results**: SweetAlert2 modals display timestamped feedback and explanation.  
  6. **Email copy**: Participants can enter an email to receive an HTML-formatted summary with a link to their personal “Runner Dashboard.”  
  7. **Data persistence**:  
     - Saves each submission in a `screening_results` MySQL table.  
     - Provides a `[runner_dashboard]` shortcode to list past results in a scrollable table.  
     - Exportable as CSV for offline analysis.

---

## 📁 Repository Structure


---

## ⚙️ Installation

1. **Requirements**  
   - WordPress 5.0+  
   - PHP 7.4+  
   - MySQL/MariaDB  
   - HTTPS enabled  

2. **Theme/Plugin Setup**  
   - Copy the contents of this repo into your WordPress theme or create a custom plugin.  
   - Include `inc/screening-functions.php` via your theme’s `functions.php` or plugin bootstrap.  
   - Enqueue `assets/js/screening.js` and `assets/css/screening.css` in `wp_enqueue_scripts`.  

3. **Database**  
   - Ensure a table named `screening_results` exists with columns:  
     ```sql
     CREATE TABLE screening_results (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id BIGINT,
       systolic INT, diastolic INT, heartrate INT,
       ntprobnp INT, weight INT,
       pr INT, qrs INT, qt INT,
       meds_regular VARCHAR(3), meds_list TEXT,
       smoker_current VARCHAR(3), smoker_former VARCHAR(3),
       hypertension VARCHAR(3), mi VARCHAR(3),
       heart_surgery_past VARCHAR(3), angiography VARCHAR(3),
       pci VARCHAR(3), pacemaker VARCHAR(3),
       valve_disease VARCHAR(3), heart_failure VARCHAR(3),
       afib VARCHAR(3), congenital_hd VARCHAR(3),
       stroke_tia VARCHAR(3), hyperlipidemia VARCHAR(3),
       other_anamnes TEXT,
       screening_result VARCHAR(10),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```
   - Update the table name in `screening-functions.php` if necessary.

4. **Pages & Shortcodes**  
   - Create a **Screening** page and paste the form template or use a shortcode like `[cardiosmart_form]`.  
   - Create a **Runner Dashboard** page and insert `[runner_dashboard]`.

5. **SMTP Configuration**  
   - Configure SendGrid (or another SMTP provider) in WordPress to ensure reliable email delivery.  
   - Set `wp_mail_from` and `wp_mail_from_name` filters as shown in `screening-functions.php`.

---

## 📖 Usage

1. **Visitor Experience**  
   - First visit: registration modal → informed consent → screening form.  
   - Fill out collapsible sections; enter clinical measurements.  
   - Submit to see a color-coded SweetAlert2 popup.  
   - Optional: receive result by email with a link to view past submissions.

2. **Admin / Developer**  
   - Monitor submissions via the `screening_results` table or in the WordPress dashboard (PHPMyAdmin).  
   - Export data as CSV if needed for research or reporting.  
   - Adjust risk thresholds directly in `screening.js` or via localized script variables.

---

## 🔧 Configuration

- **Risk thresholds** (in `screening.js`): customize the ranges for  
  - Systolic ≥ 140 mmHg / Diastolic ≥ 90 mmHg  
  - Heart rate outside 60–80 bpm  
  - NT-proBNP ≥ 125 ng/L  
  - Weight outside 60–85 kg  
  - ECG intervals (PR, QRS, QT)  
- **Modal text** and **button styling**: update CSS variables or translate labels in the HTML template.

---

## 🤝 Contributing

1. Fork the repository  
2. Create your feature branch (`git checkout -b feature/foo`)  
3. Commit your changes (`git commit -am 'Add foo'`)  
4. Push to the branch (`git push origin feature/foo`)  
5. Open a Pull Request  

Please follow the existing coding style and document any new public functions.

---


*Built with ❤️ for early detection of cardiovascular risks in runners.*  
