const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Home Page
router.get("/", (req, res) => {
    db.query("SELECT * FROM employees", (err, employees) => {
        res.render("index", { employees });
    });
});

// Add Employee Page
router.get("/add", (req, res) => {
    res.render("addEmployee");
});

// Add Employee POST
router.post("/add", (req, res) => {
    const { name, email, department, basic_salary } = req.body;
    const sql = "INSERT INTO employees (name, email, department, basic_salary) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, department, basic_salary], () => {
        res.redirect("/");
    });
});

// Generate Payroll
router.get("/payroll/:id", (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM employees WHERE id = ?", [id], (err, result) => {
        const employee = result[0];

        const hra = employee.basic_salary * 0.20;
        const da = employee.basic_salary * 0.10;
        const deductions = employee.basic_salary * 0.05;
        const net_salary = employee.basic_salary + hra + da - deductions;

        const sql = `
            INSERT INTO payroll (employee_id, hra, da, deductions, net_salary, pay_date)
            VALUES (?, ?, ?, ?, ?, CURDATE())
        `;

        db.query(sql, [id, hra, da, deductions, net_salary], () => {
            res.redirect("/report");
        });
    });
});

// Payroll Report
router.get("/report", (req, res) => {
    const sql = `
        SELECT p.*, e.name 
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        ORDER BY pay_date DESC
    `;
    db.query(sql, (err, report) => {
        res.render("report", { report });
    });
});

module.exports = router;