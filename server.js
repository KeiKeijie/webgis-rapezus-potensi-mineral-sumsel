const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pgadmin_RapezUs',
  password: '', // Kosongkan karena bypass
  port: 5432,
});

async function getGeoJSON(tableName) {

  console.log("Mengakses tabel:", tableName);

  const query = `
  SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(features.feature)
  )
  FROM (
      SELECT jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::jsonb,
          'properties', to_jsonb(inputs) - 'geom'
      ) AS feature
      FROM (
          SELECT * FROM "${tableName}"
      ) inputs
  ) features;
  `;

  const res = await pool.query(query);

  console.log("Berhasil:", tableName);

  console.log(JSON.stringify(Object.values(res.rows[0])[0], null, 2));
  return Object.values(res.rows[0])[0];
}

// Endpoint API
app.get('/api/potensi-batubara', async (req, res) => {
  try { res.json(await getGeoJSON('potensi_batubara_adm')); }
 catch(err){
    console.error(err);
    res.status(500).json(err);
}})

app.get('/api/potensi-logam', async (req, res) => {
  try { res.json(await getGeoJSON('potensi_logam_mulia')); }
catch(err){
    console.error(err);
    res.status(500).json(err);
}})

app.get('/api/potensi-semen', async (req, res) => {
  try { res.json(await getGeoJSON('potensi_industri_semen_kapur')); }
catch(err){
    console.error(err);
    res.status(500).json(err);
}})

app.get('/api/potensi-batuan-komersial', async (req, res) => {
  try { res.json(await getGeoJSON('potensi_batuan_komersial_ornamen')); }
catch(err){
    console.error(err);
    res.status(500).json(err);
}})

app.get('/api/potensi-material-konstruksi', async (req, res) => {
  try { res.json(await getGeoJSON('potensi_material_konstruksi_golonganc')); }
catch(err){
    console.error(err);
    res.status(500).json(err);
}})

app.listen(5000, () => {
  console.log('Backend WebGIS Anti-Lag Aktif di Port 5000! 🚀');
});