const pool = require("../db");

/* =========================================================
   CREATE CAR (ADMIN ONLY)
   ========================================================= */
exports.createCar = async (req, res) => {
  try {
    const {
      title,
      make,
      model,
      year,
      price,
      mileage,
      transmission,
      fuel_type,
      engine_size,
      color,
      description,
      status,
    } = req.body;

    if (!title || !make || !model || !price) {
      return res.status(400).json({
        error: "title, make, model, price are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO cars (
                title, make, model, year, price,
                mileage, transmission, fuel_type,
                engine_size, color, description, status
            )
            VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,
                $9,$10,$11,$12
            )
            RETURNING *`,
      [
        title,
        make,
        model,
        year,
        price,
        mileage,
        transmission,
        fuel_type,
        engine_size,
        color,
        description,
        status || "available",
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   GET ALL CARS (FILTERS + RANGE + PAGINATION)
========================================================= */
exports.getCars = async (req, res) => {
  try {
    let {
      make,
      model,
      transmission,
      fuel_type,
      status,
      minPrice,
      maxPrice,
      minMileage,
      maxMileage,
      minYear,
      maxYear,
      page = 1,
      limit = 10,
    } = req.query;

    // normalize
    if (transmission) transmission = transmission.toLowerCase();
    if (fuel_type) fuel_type = fuel_type.toLowerCase();
    if (status) status = status.toLowerCase();

    let filters = [];
    let values = [];
    let i = 1;

    // filters
    if (make) {
      filters.push(`c.make ILIKE $${i++}`);
      values.push(`%${make}%`);
    }

    if (model) {
      filters.push(`c.model ILIKE $${i++}`);
      values.push(`%${model}%`);
    }

    if (transmission) {
      filters.push(`LOWER(c.transmission) = $${i++}`);
      values.push(transmission);
    }

    if (fuel_type) {
      filters.push(`LOWER(c.fuel_type) = $${i++}`);
      values.push(fuel_type);
    }

    if (status) {
      filters.push(`LOWER(c.status) = $${i++}`);
      values.push(status);
    }

    // ranges
    if (minPrice) {
      filters.push(`c.price >= $${i++}`);
      values.push(minPrice);
    }

    if (maxPrice) {
      filters.push(`c.price <= $${i++}`);
      values.push(maxPrice);
    }

    if (minMileage) {
      filters.push(`c.mileage >= $${i++}`);
      values.push(minMileage);
    }

    if (maxMileage) {
      filters.push(`c.mileage <= $${i++}`);
      values.push(maxMileage);
    }

    if (minYear) {
      filters.push(`c.year >= $${i++}`);
      values.push(minYear);
    }

    if (maxYear) {
      filters.push(`c.year <= $${i++}`);
      values.push(maxYear);
    }

    const offset = (page - 1) * limit;

    // MAIN QUERY WITH IMAGES
    let query = `
            SELECT 
                c.*,
                COALESCE(
                    json_agg(ci.image_url) FILTER (WHERE ci.image_url IS NOT NULL),
                    '[]'
                ) AS images
            FROM cars c
            LEFT JOIN car_images ci ON c.id = ci.car_id
        `;

    if (filters.length > 0) {
      query += " WHERE " + filters.join(" AND ");
    }

    query += " GROUP BY c.id";

    values.push(limit);
    values.push(offset);

    query += ` ORDER BY c.created_at DESC LIMIT $${i++} OFFSET $${i++}`;

    const result = await pool.query(query, values);

    res.json({
      page: Number(page),
      limit: Number(limit),
      results: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   GET SINGLE CAR
========================================================= */
exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM cars WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   UPDATE CAR (ADMIN ONLY - SAFE PARTIAL UPDATE)
========================================================= */
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      make,
      model,
      year,
      price,
      mileage,
      transmission,
      fuel_type,
      engine_size,
      color,
      description,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE cars SET
                title = COALESCE($1, title),
                make = COALESCE($2, make),
                model = COALESCE($3, model),
                year = COALESCE($4, year),
                price = COALESCE($5, price),
                mileage = COALESCE($6, mileage),
                transmission = COALESCE($7, transmission),
                fuel_type = COALESCE($8, fuel_type),
                engine_size = COALESCE($9, engine_size),
                color = COALESCE($10, color),
                description = COALESCE($11, description),
                status = COALESCE($12, status)
            WHERE id = $13
            RETURNING *`,
      [
        title,
        make,
        model,
        year,
        price,
        mileage,
        transmission,
        fuel_type,
        engine_size,
        color,
        description,
        status,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   DELETE CAR (ADMIN ONLY - SAFE DELETE)
========================================================= */
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM cars WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadCarImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No images uploaded",
      });
    }

    const results = [];

    for (let file of req.files) {
      const result = await pool.query(
        `INSERT INTO car_images (car_id, image_url)
                 VALUES ($1, $2)
                 RETURNING *`,
        [id, `/uploads/${file.filename}`],
      );

      results.push(result.rows[0]);
    }

    res.status(201).json({
      message: "Images uploaded successfully",
      images: results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* =========================================================
   GET FILTER OPTIONS (DYNAMIC FROM DB)
========================================================= */
exports.getFilters = async (req, res) => {
  try {
    const query = `
      SELECT 
        array_agg(DISTINCT make) FILTER (WHERE make IS NOT NULL) AS makes,

        json_agg(DISTINCT jsonb_build_object(
          'make', make,
          'model', model
        )) FILTER (WHERE model IS NOT NULL) AS models,

        array_agg(DISTINCT fuel_type) FILTER (WHERE fuel_type IS NOT NULL) AS fuel_types,
        array_agg(DISTINCT transmission) FILTER (WHERE transmission IS NOT NULL) AS transmissions,

        array_agg(DISTINCT year ORDER BY year DESC) FILTER (WHERE year IS NOT NULL) AS years,

        array_agg(DISTINCT price ORDER BY price ASC) FILTER (WHERE price IS NOT NULL) AS prices,

        array_agg(DISTINCT mileage ORDER BY mileage ASC) FILTER (WHERE mileage IS NOT NULL) AS mileages

      FROM cars;
    `;

    const result = await pool.query(query);

    res.json({
      makes: result.rows[0].makes || [],
      models: result.rows[0].models || [],
      fuelTypes: result.rows[0].fuel_types || [],
      transmissions: result.rows[0].transmissions || [],
      years: result.rows[0].years || [],
      prices: result.rows[0].prices || [],
      mileages: result.rows[0].mileages || [],
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};