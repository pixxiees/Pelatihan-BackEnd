const db = require('../config/missionDatabase');

class Mission {
    static createGeoJSON(coord) {
        return {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: coord.map(([lat, lng]) => [lng, lat])
            }
        };
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM missions',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    const missions = rows.map(row => ({
                        ...row,
                        coord: JSON.parse(row.coord),
                        home: JSON.parse(row.home),
                        geoJSON: JSON.parse(row.geoJSON)
                    }));
                    resolve({ missions });
                }
            );
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM missions WHERE mission_id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    if (!row) resolve(null);
                    const mission = {
                        ...row,
                        coord: JSON.parse(row.coord),
                        home: JSON.parse(row.home),
                        geoJSON: JSON.parse(row.geoJSON)
                    };
                    resolve(mission);
                }
            );
        });
    }

    static async create(missionData) {
        const { nama, coord } = missionData;
        const home = coord[0];
        const geoJSON = this.createGeoJSON(coord);

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO missions (nama, coord, home, geoJSON)
                VALUES (?, ?, ?, ?)`,
                [
                    nama,
                    JSON.stringify(coord),
                    JSON.stringify(home),
                    JSON.stringify(geoJSON)
                ],
                function (err) {
                    if (err) reject(err);
                    resolve({
                        mission_id: this.lastID,
                        nama,
                        coord,
                        home,
                        geoJSON
                    });
                }
            );
        });
    }

    static async update(id, missionData) {
        const { nama, coord } = missionData;
        const home = coord[0];
        const geoJSON = this.createGeoJSON(coord);

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE missions
                SET nama = ?, coord = ?, home = ?, geoJSON = ?
                WHERE mission_id = ?`,
                [
                    nama,
                    JSON.stringify(coord),
                    JSON.stringify(home),
                    JSON.stringify(geoJSON),
                    id
                ],
                function (err) {
                    if (err) reject(err);
                    if (this.changes === 0) resolve(null);
                    resolve({
                        mission_id: id,
                        nama,
                        coord,
                        home,
                        geoJSON
                    });
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM missions WHERE mission_id = ?',
                [id],
                function (err) {
                    if (err) reject(err);
                    resolve(this.changes > 0);
                }
            );
        });
    }
}

module.exports = Mission;