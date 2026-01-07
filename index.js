const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'abc',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

global.db = mysql.createConnection({
    host: 'localhost',
    user: 'freeaccess',
    password: '',
    database: 'dbadt'
})

global.db.connect(function(err){
    if(err){
        console.error(err);
        process.exit(1);
    } else {
        console.log("Database connected");
    }
});

var loadFlag = false;
app.get('/', (req, res) => {
    let selectedColumns = req.session.selectedColumns || ['country_name', 'year', 'gdp', 'gdp_growth', 'gdp_per_capita', 'unemployment_percentage', 'pop_total', 'pop_growth', 'life_expectancy', 'infant_mortality_rate', 'num_of_undernourished'];
    let selectedCountryNames = req.session.countryNames || ['Afghanistan', 'Bangladesh', 'India', 'Nepal', 'Pakistan', 'Sri Lanka'];

    queryParams = [...selectedColumns, "-", ...selectedCountryNames].join("+");
    console.log(selectedColumns)
    
    let countryFilter = '';
    if (selectedCountryNames.length > 1 && Array.isArray(selectedCountryNames)) {
        if (!selectedColumns.includes("country_name")) {
            selectedColumns.unshift("country_name");
        }
        const specificCountries = selectedCountryNames.map(name => `'${name}'`).join(", ");
        countryFilter = `WHERE c.country_name IN (${specificCountries})`;
    }
    else if(typeof(selectedCountryNames) === "string") {
        if (!selectedColumns.includes("country_name")) {
            selectedColumns.unshift("country_name");
        }
        countryFilter = `WHERE c.country_name = '${selectedCountryNames}'`;
    }
    else {
        countryFilter = '';
        selectedColumns.includes("country_name") ? selectedColumns.splice(selectedColumns.indexOf("country_name"), 1) : null;
    }

    if (selectedColumns.length > 0) {
        for (let i = 0; i < selectedColumns.length; i++) {
            if (selectedColumns[i] === 'country_name') {
                if (selectedCountryNames.length > 0) {
                    selectedColumns.splice(i, 1, `c.country_name`)
                }
                else {
                    selectedColumns.splice(i, 1);
                    i--;
                }
            }
            else if (selectedColumns[i] === 'year') {
                console.log("year")
                selectedColumns.splice(i, 1, `e.year`);
            }
            else if (selectedColumns[i] === 'gdp') {
                console.log("gdp")
                selectedColumns.splice(i, 1, `e.gdp`);
            }
            else if (selectedColumns[i] === 'gdp_growth') {
                selectedColumns.splice(i, 1, `e.gdp_growth`);
            }
            else if (selectedColumns[i] === 'gdp_per_capita') {
                selectedColumns.splice(i, 1, `e.gdp_per_capita`);
            }
            else if (selectedColumns[i] === 'unemployment_percentage') {
                selectedColumns.splice(i, 1, `e.unemployment_percentage`);
            }
            else if (selectedColumns[i] === 'pop_total') {
                selectedColumns.splice(i, 1, `e.pop_total`);
            }
            else if (selectedColumns[i] === 'pop_growth') {
                selectedColumns.splice(i, 1, `e.pop_growth`);
            }
            else if (selectedColumns[i] === 'life_expectancy') {
                selectedColumns.splice(i, 1, `e.life_expectancy`);
            }
            else if (selectedColumns[i] === 'infant_mortality_rate') {
                selectedColumns.splice(i, 1, `e.infant_mortality_rate`);
            }
            else if (selectedColumns[i] === 'num_of_undernourished') {
                selectedColumns.splice(i, 1, `u.num_of_undernourished`);
            }
        }
    }
    
    let loadQuery = ``; 
    if(!loadFlag){
        loadQuery = `SELECT c.country_name, e.year, e.gdp, e.gdp_growth, e.gdp_per_capita, e.unemployment_percentage, e.pop_total, 
                            e.pop_growth, e.life_expectancy, e.infant_mortality_rate, u.num_of_undernourished 
                            FROM countries c 
                            JOIN economy_stats e ON c.country_id = e.country_id 
                            LEFT JOIN undernourishment_stats u ON c.country_id = u.country_id AND e.year = u.year 
                            ORDER BY e.year`;
        loadFlag = true;
    }
    else {
        console.log(selectedColumns);
        console.log(countryFilter);
        loadQuery = `SELECT ${selectedColumns}
                        FROM countries c 
                        JOIN economy_stats e ON c.country_id = e.country_id 
                        LEFT JOIN undernourishment_stats u ON c.country_id = u.country_id AND e.year = u.year 
                        ${countryFilter}
                        ORDER BY e.year`;

    }

    global.db.query(loadQuery, (err, results) => {
        if (err) {
            console.error(err);
        } else {
            res.render('index.ejs', { data: results, selectedCountries: selectedCountryNames });
        }
    })
});

app.post('/', (req, res) => {
    req.session.selectedColumns = req.body.columns || [];
    req.session.countryNames = req.body.countryNames || [];
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// const fs = require('fs');
// const csv = require('csv-parser');
// function gdpCsvToDB(path) {
//     fs.createReadStream(path)
//         .pipe(csv())
//         .on('data', (row) => {
//             const countryName = row.Country;
//             const year = row.Year;
//             const gdp = row['GDP (current US$)'];
//             const gdpGrowth = row['GDP growth (annual %)'];
//             const gdpCapita = row['GDP per capita (current US$)'];
//             const unemployment = row['Unemployment, total (% of total labor force) (modeled ILO estimate)'];
//             const population = row['Population, total'];
//             const populationGrowth = row['Population growth (annual %)'];
//             const lifeExpectancy = row['Life expectancy at birth, total (years)'];
//             const mortalityRate = row['Mortality rate, infant (per 1,000 live births)'];

//             const countryQuery = `SELECT country_id FROM countries WHERE country_name = ?`;
//             global.db.query(countryQuery, [countryName], (err, results) => {
//                 if (err) {
//                     console.error(err);
//                 } else {
//                     console.log(results)
//                     const countryId = results[0].country_id;

//                     const econQuery = `INSERT INTO economy_stats (country_id, year, gdp, gdp_growth, gdp_per_capita, unemployment_percentage, pop_total, pop_growth, life_expectancy, infant_mortality_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//                     global.db.query(econQuery, [countryId, year, gdp, gdpGrowth, gdpCapita, unemployment, population, populationGrowth, lifeExpectancy, mortalityRate], (err, results) => {
//                         if (err) {
//                             console.error(err);
//                         } else {
//                             console.log(results);
//                         }
//                     });
//                 }
//             });
//         })
//         .on('end', () => {
//             console.log('CSV processed');
//         });
// }
// gdpCsvToDB('dataset/gdp-updated.csv');

// function nourishmentCsvToDB(path) {
//     fs.createReadStream(path)
//         .pipe(csv())
//         .on('data', (row) => {
//             const countryName = row.Entity;
//             const year = row.Year;
//             const prevalence = row.PrevalenceOfUndernourishment;

//             const countryQuery = `SELECT country_id FROM countries WHERE country_name = ?`;
//             global.db.query(countryQuery, [countryName], (err, results) => {
//                 if (err) {
//                     console.error(err);
//                 } else {
//                     const countryId = results[0].country_id;

//                     const unnourishQuery = `INSERT INTO undernourishment_stats (country_id, year, num_of_undernourished) VALUES (?, ?, ?)`;
//                     global.db.query(unnourishQuery, [countryId, year, prevalence], (err, results) => {
//                         if (err) {
//                             console.error(err);
//                         } else {
//                             console.log(results);
//                         }
//                     });
//                 }
//             });
//         })
//         .on('end', () => {
//             console.log('CSV processed');
//         });
// }
// nourishmentCsvToDB('dataset/undernourishment-updated.csv');