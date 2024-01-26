const inquirer = require("inquirer");
const connection = require("./config/connection");
const consoleTable = require("console.table");

// Database connection and presentation
connection.connect((err) => {
  if (err) throw err;
  console.log("EMPLOYEE TRACKER");
  console.log;
  promptTracker();
});

// Menu to select an option
const promptTracker = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          "View all employees",
          "View all roles",
          "View all departments",
          "Add an employee",
          "Add a role",
          "Add a department",
          "Update an employee role",
        ],
      },
    ])
    .then((answers) => {
      const { menu } = answers;

      if (menu === "View all employees") {
        viewAllEmployees();
      } else if (menu === "View all roles") {
        viewAllRoles();
      } else if (menu === "View all departments") {
        viewAllDepartments();
      } else if (menu === "Add an employee") {
        addAnEmployee();
      } else if (menu === "Add a role") {
        addARole();
      } else if (menu === "Add a department") {
        addADepartment();
      } else if (menu === "Update an employee role") {
        updateAnEmployee();
      }
    });
};

//Exit
const exit = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "exitQuestion",
        message: "Do you want to consult or do anything else (y/n)?",
      },
    ])
    .then((answer) => {
      if (answer.exitQuestion === "n") {
        console.log("");
        console.log("Thank you for consulting!");
        console.log("");
        process.exit(0);
        return;
      } else if (answer.exitQuestion === "y") {
        promptTracker();
      }
    });
};

// View all employees
const viewAllEmployees = () => {
  let mysql = `SELECT 
  emp_id,
  emp_first_name, 
  emp_last_name,
  emp_role_id,
  emp_manager_id
  FROM employee`;
  
  connection.query(mysql, (err, res) => {
    if (err) throw err;
    console.log(`Current Employees: `);
    console.log(" ");
    console.table(res);
    exit();
  });
};

//View all roles
const viewAllRoles = () => {
  let mysql = `SELECT
  role_id,
  role_title,
  role_salary,
  role_department_id
  FROM role`;
  connection.query(mysql, (err, res) => {
    if (err) throw err;
    console.log(`Current Employee Roles: `);
    console.log(" ");
    console.table(res);
    exit();
  });
};

//View all departments
const viewAllDepartments = () => {
  let mysql = `SELECT 
  dep_name
  FROM department`;
  connection.query(mysql, (err, res) => {
    if (err) throw err;
    console.log(`Current Departments:`);
    console.log(" ");
    console.table(res);
    exit();
  });
};

//Add An Employee
const addAnEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
      },
    ])
    .then((answer) => {
      const employeeData = [answer.firstName, answer.lastName];
      const mysqlRole = `SELECT * FROM role`;
      connection.query(mysqlRole, (err, res) => {
        if (err) throw err;
        let rolesArray = [];
        res.forEach((role) => {
          rolesArray.push(role.role_title);
        });
        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employees role?",
              choices: rolesArray,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            employeeData.push(role);
            const mysqlManager = `SELECT * FROM employee`;
            connection.query(mysqlManager, (err, res) => {
              if (err) throw err;
              let managersArray = [];
              res.forEach((employee) => {
                managersArray.push(
                  `${employee.emp_first_name} ${employee.emp_last_name}`
                );
              });
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employees manager?",
                    choices: managersArray,
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager;
                  employeeData.push(manager);
                  const mysql = `INSERT INTO employee (
                    emp_first_name, 
                    emp_last_name, 
                    emp_role_id, 
                    emp_manager_id)
                    VALUES (?, ?, ?, ?)`;
                  connection.query(mysql, employeeData, (err) => {
                    if (err) throw err;
                    console.log("Employee has been added!");
                    viewAllEmployees();
                  });
                });
            });
          });
      });
    });
};

//Add A Role
const addARole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "What is the title of the role?",
      },
      {
        type: "input",
        name: "roleSalary",
        message: "What is the salary of the role?",
      },
    ])
    .then((answer) => {
      roleData = [answer.roleTitle, answer.roleSalary];
      const mysqlDep = `SELECT * FROM department`;
      connection.query(mysqlDep, (err, res) => {
        if (err) throw err;
        let deptNamesArray = [];
        res.forEach((department) => {
          deptNamesArray.push(department.dep_name);
        });
        inquirer
          .prompt([
            {
              type: "list",
              name: "department",
              message: "What department does the role belong to?",
              choices: deptNamesArray,
            },
          ])
          .then((departmentChoice) => {
            const department = departmentChoice.department;
            roleData.push(department);
            console.log(roleData);
            const mysql = `INSERT INTO role (
              role_title, 
              role_salary, 
              role_department_id)
              VALUES (?, ?, ?)`;
            connection.query(mysql, roleData, (err) => {
              if (err) throw err;
              console.log("Role has been added!");
              viewAllRoles();
            });
          });
      });
    });
};

//Add A Department
const addADepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDepartment",
        message: "What is the name of the department?",
      },
    ])
    .then((answer) => {
      let mysql = `INSERT INTO department (dep_name) VALUES (?)`;
      connection.query(mysql, answer.newDepartment, (err, res) => {
        if (err) throw err;
        console.log("Department successfully added!");
        viewAllDepartments();
      });
    });
};

//Update an employee
const updateAnEmployee = () => {
  let mysql = 
  `SELECT e.emp_id, e.emp_first_name, e.emp_last_name FROM employee e`;
  connection.query(mysql, (err, res) => {
    if (err) throw err;
    let employeesArray = [];
    res.forEach((employee) => {
      employeesArray.push(
        `${employee.emp_first_name} `
      );
    });

    let mysql = 
    `SELECT r.role_id, r.role_title FROM role r`;
    connection.query(mysql, (err, res) => {
      if (err) throw err;
      let rolesArray = [];
      res.forEach((role) => {
        rolesArray.push(role.role_title);
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "updateEmployee",
            message:
              "Who is the employee would you like to change his role?",
            choices: employeesArray,
          },
          {
            type: "list",
            name: "updateRole",
            message: "What is their new role? ",
            choices: rolesArray,
          },
        ])
        .then((answer) => {
          const employee_name = answer.updateEmployee;
          let sqls = 
          `UPDATE employee 
          SET emp_role_id = ?
          WHERE emp_first_name = ?`;
          connection.query(sqls, [answer.updateRole, employee_name], (err) => {
            if (err) throw err;
            console.log(`Employee Role Updated`);
            viewAllEmployees();
          });
        });
    });
  });
};
