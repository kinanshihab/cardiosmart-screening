# CardioSmart Screening Platform

**A digital cardiovascular risk assessment tool for endurance athletes.**

CardioSmart is a responsive web integration designed to screen recreational runners and athletes for heart health risks. Developed in collaboration with **Karolinska Institutet**, the platform collects anamnesis and clinical data, performs real-time risk classification, and provides immediate feedback to the user.

---

## 🎥 See It In Action

Watch the full user flow—from registration to clinical data entry.

<div align="center">
  <video src="Video Project 2.mp4" width="100%" controls autoplay loop muted></video>
  <br>
  <em>(Click play to view the screening workflow)</em>
</div>

---

## 🚀 Key Features

* **Seamless User Onboarding:**
    * Registration modal for first-time visitors.
    * Digital informed consent overlay before data collection.
* **Interactive Health Form:**
    * **Medical History:** Medication usage, smoking habits, and existing conditions.
    * **Cardiology:** Detailed anamnesis (Hypertension, MI, Arrhythmias).
    * **Symptom Check:** Chest pain, dizziness, palpitations during exertion.
    * **Training Background:** Activity levels and conditioning history.
    * **Clinical Parameters:** Input for Blood Pressure, Heart Rate, NT-proBNP, Weight, and ECG intervals.
* **Smart Risk Assessment:**
    * Real-time logic analyzes inputs against configurable medical thresholds.
    * Immediate "Traffic Light" feedback (Green/Yellow/Red) via SweetAlert2 modals.
* **Runner Dashboard:**
    * Integrated "Runner Dashboard" allowing users to track historical screening results.
    * Automated email summaries with HTML formatting.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3 (Responsive Grid), JavaScript (ES6+), SweetAlert2.
* **Backend:** PHP (WordPress Environment).
* **Database:** MySQL / MariaDB.
* **Integrations:** SMTP (SendGrid) for transactional emails.

---

## ⚙️ Installation & Setup

*Since all source code is included in the repository files, follow these high-level steps to deploy:*

1.  **Database Setup:**
    * Locate the SQL file included in this repository.
    * Import it into your MySQL database to create the required `screening_results` table.

2.  **WordPress Integration:**
    * Place the `assets` folder and PHP includes into your active theme or plugin directory.
    * Enqueue the scripts and styles in your `functions.php`.

3.  **Shortcodes:**
    * Use the provided shortcodes to embed the **Screening Form** and **Runner Dashboard** onto your desired WordPress pages.

4.  **Configuration:**
    * Ensure your SMTP settings are configured for email delivery.
    * *(Optional)* Adjust risk thresholds in the JavaScript config file if clinical guidelines change.

---

## 🤝 Contributing

Contributions are welcome! Please follow standard pull request procedures:
1.  Fork the repository.
2.  Create a feature branch.
3.  Submit a Pull Request.

---

*Built for the early detection of cardiovascular risks in runners.*
