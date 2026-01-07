USE dbadt;

CREATE TABLE IF NOT EXISTS countries (
    country_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    country_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS economy_stats (
    econ_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    country_id INTEGER NOT NULL,
    year YEAR NOT NULL,
    gdp DOUBLE NOT NULL,
    gdp_growth DOUBLE NOT NULL,
    gdp_per_capita DOUBLE NOT NULL,
    unemployment_percentage FLOAT NOT NULL,
    pop_total DOUBLE NOT NULL,
    pop_growth FLOAT NOT NULL,
    life_expectancy FLOAT NOT NULL,
    infant_mortality_rate FLOAT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES countries(country_id),
    UNIQUE KEY candidate_key (country_id, year)
);

CREATE TABLE IF NOT EXISTS undernourishment_stats (
    undernourish_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    country_id INTEGER NOT NULL,
    year YEAR NOT NULL,
    num_of_undernourished FLOAT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
    UNIQUE KEY candidate_key (country_id, year)
);

INSERT INTO countries (country_name) VALUES ('Afghanistan'),('Bangladesh'),('India'),('Nepal'),('Pakistan'),('Sri Lanka');