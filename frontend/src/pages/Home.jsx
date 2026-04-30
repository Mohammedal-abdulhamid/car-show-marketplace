import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { carData } from "../data/carData";
import { heroImages } from "../data/heroImages";
import { carPlaceholders } from "../data/placeholders";

export default function Home() {
  // ---------------- STATE ----------------
  const [cars, setCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [status, setStatus] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [minMileage, setMinMileage] = useState("");
  const [maxMileage, setMaxMileage] = useState("");

  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

  const debounceRef = useRef(null);

  // ---------------- FETCH FILTERED ----------------
  const fetchCars = async () => {
    try {
      const res = await api.get("/cars", {
        params: {
          make,
          model,
          fuel_type: fuelType,
          transmission,
          status,
          minPrice,
          maxPrice,
          minMileage,
          maxMileage,
          minYear,
          maxYear,
        },
      });

      setCars(res.data.results);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- FETCH ALL FOR FILTERS ----------------
  const fetchAllCars = async () => {
    try {
      const res = await api.get("/cars");
      setAllCars(res.data.results || res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAllCars();
    fetchCars();
  }, []);

  // ---------------- LIVE FILTER ----------------
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchCars();
    }, 400);
  }, [
    make,
    model,
    fuelType,
    transmission,
    status,
    minPrice,
    maxPrice,
    minMileage,
    maxMileage,
    minYear,
    maxYear,
  ]);

  // ---------------- DYNAMIC OPTIONS ----------------
  const uniqueMakes = [...new Set(allCars.map((c) => c.make).filter(Boolean))];

  const uniqueModels = [
    ...new Set(
      allCars
        .filter((c) => !make || c.make === make)
        .map((c) => c.model)
        .filter(Boolean),
    ),
  ];

  // ---------------- UI ----------------

  const clearFilters = () => {
    setMake("");
    setModel("");
    setFuelType("");
    setTransmission("");
    setStatus("");

    setMinPrice("");
    setMaxPrice("");

    setMinMileage("");
    setMaxMileage("");

    setMinYear("");
    setMaxYear("");
  };
  return (
    <div className="min-h-screen bg-gray-100">
      {/* HERO */}
      <div className="relative h-[500px] w-full overflow-hidden">
        {/* IMAGE (with fade effect) */}
        <img
          key={heroIndex}
          src={heroImages[heroIndex]}
          className="absolute w-full h-full object-cover transition-opacity duration-700 opacity-100"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* NAVBAR */}
        <div className="absolute top-0 w-full flex justify-between items-center px-8 py-5 text-white z-10">
          <h1 className="text-2xl font-bold">MTS Moto</h1>

          <div className="flex gap-6 text-sm">
            <button className="hover:text-gray-300">Home</button>
            <button className="hover:text-gray-300">Cars</button>
            <button className="hover:text-gray-300">Contact</button>
          </div>
        </div>

        {/* HERO TEXT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <h2 className="text-4xl font-bold">Find Your Perfect Car</h2>

          <p className="text-gray-200 mt-2">
            Thousands of listings updated daily
          </p>

          {/* DOT NAVIGATION */}
          <div className="flex gap-2 mt-4">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  i === heroIndex ? "bg-white" : "bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex max-w-7xl mx-auto px-4 py-6 gap-6">
        {/* SIDEBAR */}
        <div className="w-72 bg-white p-5 rounded-xl shadow space-y-4 sticky top-4">
          <h2 className="text-lg font-bold">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
            disabled={
              !make &&
              !model &&
              !fuelType &&
              !transmission &&
              !status &&
              !minPrice &&
              !maxPrice &&
              !minMileage &&
              !maxMileage &&
              !minYear &&
              !maxYear
            }
          >
            Clear All
          </button>

          {/* MAKE */}
          <select
            className="w-full p-2 border rounded"
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel("");
            }}
          >
            <option value="">All Makes</option>

            {Object.keys(carData).map((makeName) => (
              <option key={makeName} value={makeName}>
                {makeName}
              </option>
            ))}
          </select>

          {/* MODEL */}
          <select
            className="w-full p-2 border rounded"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="">All Models</option>

            {make &&
              carData[make]?.map((modelName) => (
                <option key={modelName} value={modelName}>
                  {modelName}
                </option>
              ))}
          </select>

          {/* FUEL */}
          <select
            className="w-full p-2 border rounded"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
          >
            <option value="">Fuel Type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* TRANSMISSION */}
          <select
            className="w-full p-2 border rounded"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          >
            <option value="">Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>

          {/* STATUS */}
          <select
            className="w-full p-2 border rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>

          {/* PRICE */}
          <div className="flex gap-2">
            <input
              className="w-1/2 p-2 border rounded"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              className="w-1/2 p-2 border rounded"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          {/* MILEAGE */}
          <div className="flex gap-2">
            <input
              className="w-1/2 p-2 border rounded"
              placeholder="Min Mileage"
              value={minMileage}
              onChange={(e) => setMinMileage(e.target.value)}
            />
            <input
              className="w-1/2 p-2 border rounded"
              placeholder="Max Mileage"
              value={maxMileage}
              onChange={(e) => setMaxMileage(e.target.value)}
            />
          </div>

          {/* YEAR */}
          <div className="flex gap-2">
            <input
              className="w-1/2 p-2 border rounded"
              placeholder="Min Year"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
            />
            <input
              className="w-1/2 p-2 border rounded"
              placeholder="Max Year"
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
            />
          </div>
        </div>

        {/* CARS GRID */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="h-48 bg-gray-200">
                {car.images?.[0] ? (
                  <img
                    src={`http://localhost:5001${car.images[0]}`}
                    className="w-full h-full object-cover"
                    alt={car.title}
                  />
                ) : (
                  <img
                    src={carPlaceholders[car.id % carPlaceholders.length]}
                    className="w-full h-full object-cover"
                    alt="placeholder"
                  />
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold">{car.title}</h3>
                <p className="text-sm text-gray-500">
                  {car.make} • {car.model} • {car.year}
                </p>
                <p className="text-lg font-bold mt-2">£{car.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
