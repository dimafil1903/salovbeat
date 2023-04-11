const db = require('../../database/database');
const e = require("express");

// Define a function to insert a new track into the database
function saveReview(track) {
    const sql = `INSERT INTO reviews
                 (release_name, personal_impressions, trendiness, text_and_lyrics_structure, melody_and_performance,
                  arrangement, type, parent_id)
                 VALUES ($releaseName, $personalImpressions, $trendiness, $textAndLyricsStructure,
                         $melodyAndPerformance, $arrangement, $type, $parentId)`;

    return new Promise((resolve, reject) => {
        db.run(sql, {
            $releaseName: track.title,
            $personalImpressions: track.personalImpressions,
            $trendiness: track.trendiness,
            $textAndLyricsStructure: track.structure,
            $melodyAndPerformance: track.melodicPerformance,
            $arrangement: track.arrangement,
            $type: track.type,
            $parentId: track.parentId
        }, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log(`Track saved with ID: ${this.lastID}`);
                resolve(this.lastID);
            }
        });
    });
}

function saveAlbum(album) {
    const sql = `INSERT INTO reviews
                     (release_name, type)
                 VALUES ($releaseName, 'album')`;

    return new Promise((resolve, reject) => {
        db.run(sql, {
            $releaseName: album.title,
        }, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log(`Album saved with ID: ${this.lastID}`);
                resolve(this.lastID);
            }
        });
    });
}

function updateReview(track) {
    const sql = `UPDATE reviews
                 SET release_name              = $releaseName,
                     personal_impressions      = $personalImpressions,
                     trendiness                = $trendiness,
                     text_and_lyrics_structure = $textAndLyricsStructure,
                     melody_and_performance    = $melodyAndPerformance,
                     arrangement               = $arrangement
                 WHERE id = $id`;

    return new Promise((resolve, reject) => {
        db.run(sql, {
            $releaseName: track.title,
            $personalImpressions: track.personalImpressions,
            $trendiness: track.trendiness,
            $textAndLyricsStructure: track.structure,
            $melodyAndPerformance: track.melodicPerformance,
            $arrangement: track.arrangement,
            $link: track.link,
            $id: track.id,
        }, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log(`Track with ID ${track.id} updated`);
                resolve();
            }
        });
    });
}

function updateReviewLink(track) {
    const sql = `UPDATE reviews
                 SET link = $link
                 WHERE id = $id`;

    return new Promise((resolve, reject) => {
        db.run(sql, {
            $link: track.link,
            $id: track.id,
        }, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log(`Track with ID ${track.id} updated`);
                resolve();
            }
        });
    });
}

function formatAlbum(album) {

    let t = '';
    if (album.link) {
        t = `<a href="${album.link}">${album.title}</a>`;
    } else {
        t = album.title;
    }
    let rt = calculateRating(album)
    if (isNaN(rt) || undefined === rt) {
        return t
    } else {
        return t + ` - ${rt}\n`;
    }

}

function formatAlbumDetails(album, reviews) {

    let t = '';
    if (album.link) {
        t = `<a href="${album.link}">${album.title}</a>`;
    } else {
        t = album.title;
    }
    let dataText = '';
    let rtTotal;
    let rt = 0;
    if (reviews) {
        let reviewsCount = reviews ? reviews.length : 0;
        for (let review of reviews) {
            rt += (calculateRating(review))
            dataText += formatReviewsDetails(review, true);
        }

        rtTotal = rt / reviewsCount;

        return `<b>` + t + ` - ${rtTotal} </b>\n\n` + dataText + '\n' + '________________________________\n'

    } else {
        return `<b>` + t + `</b> \n`;
    }

}

function formatAlbumSmallDetails(album, reviews) {

    let t = '';
    if (album.link) {
        t = `<a href="${album.link}">${album.title}</a>`;
    } else {
        t = album.title;
    }
    let dataText = '';
    let rtTotal;
    let rt = 0;
    if (reviews) {
        let reviewsCount = reviews ? reviews.length : 0;
        for (let review of reviews) {
            rt += calculateRating(review)
            dataText += formatReviewsSmall(review, true);
        }

        rtTotal = rt / reviewsCount;
        rtTotal = parseFloat(rtTotal);
        rtTotal.toFixed(1)
        if (isNaN(rtTotal) || undefined === rtTotal) {
            rtTotal = '';
        }
        return `<b>` + t + ` - ${rtTotal} </b> \n\n`  + dataText + '________________________________\n';

    } else {
        return `<b>` + t + `</b> \n`;
    }

}

function formatReviewsDetails(track, isAlbum = false) {

    let t = '';
    if (track.link) {
        t = `<b><a href="${track.link}">${track.title}</a></b>`;
    } else {
        t = track.title;
    }
    let pag;
    if (isAlbum) {
        pag = `      `;
    } else {
        pag = ` `;
    }
    return `  <b>${t} - ${calculateRating(track)} \n</b>`
        + pag + `Особисті враження: ${track.personalImpressions}\n`
        + pag + `Трендовість: ${track.trendiness}\n`
        + pag + `Структура тексту та пісні: ${track.structure}\n`
        + pag + `Мелодійність та виконання: ${track.melodicPerformance}\n`
        + pag + `Аранжування: ${track.arrangement}\n`;
}

function formatReviewsSmall(track, isAlbum = false) {

    let pag;
    if (isAlbum) {
        pag = `      `;
    } else {
        pag = ` `;
    }

    let t = '';
    if (track.link) {
        t = `<a href="${track.link}">${track.title}</a>`;
    } else {
        t = track.title;
    }

    return pag + t + ` - ${calculateRating(track)} \n`;
}

function getReviewsByAlbum(albumId, callback) {
    const sql = `SELECT *
                 FROM reviews
                 WHERE parent_id = ?
                   AND type = 'album'`;
    db.all(sql, [albumId], (err, rows) => {
        if (err) {
            console.error(err);
            return callback(err);
        }

        const tracks = rows.map(row => ({
            id: row.id,
            title: row.release_name,
            personalImpressions: row.personal_impressions,
            trendiness: row.trendiness,
            structure: row.text_and_lyrics_structure,
            melodicPerformance: row.melody_and_performance,
            arrangement: row.arrangement,
            link: row.link,
            type: row.type,
            createdAt: row.created_at
        }));

        console.log(`Tracks found for album id ${albumId}`);
        return callback(null, tracks);
    });
}

function getReviewById(reviewId, callback) {
    const sql = `SELECT *
                 FROM reviews
                 WHERE id = ?`;
    db.get(sql, [reviewId], (err, row) => {
        if (err) {
            console.error(err);
            return callback(err);
        }

        if (!row) {
            console.log(`No review found with the id ${reviewId}`);
            return callback(null, null);
        }

        const review = {
            id: row.id,
            title: row.release_name,
            personalImpressions: row.personal_impressions,
            trendiness: row.trendiness,
            structure: row.text_and_lyrics_structure,
            melodicPerformance: row.melody_and_performance,
            arrangement: row.arrangement,
            link: row.link,
            type: row.type,
            createdAt: row.created_at
        };
        console.log(`Review found with the id ${reviewId}`);
        return callback(null, review);
    });
}


function calculateRating(track) {
    const {personalImpressions, trendiness, structure, melodicPerformance, arrangement} = track;
    const rating = personalImpressions + trendiness + structure + melodicPerformance + arrangement;
    const roundedRating = Math.round(rating * 10) / 10;
    return roundedRating;
}

function getAllReviews(limit, offset, callback) {
    try {
        const sql = `SELECT *,
                            (personal_impressions + trendiness + text_and_lyrics_structure + melody_and_performance +
                             arrangement) AS total_score
                     FROM reviews
                     where type = 'single'
                     ORDER BY total_score DESC LIMIT ?
                     OFFSET ?`;
        db.all(sql, [limit, offset], (err, rows) => {
            if (err) {
                console.error(err);
                callback([]);
            } else {
                const reviews = rows.map(row => ({
                    id: row.id,
                    title: row.release_name,
                    personalImpressions: row.personal_impressions,
                    trendiness: row.trendiness,
                    structure: row.text_and_lyrics_structure,
                    melodicPerformance: row.melody_and_performance,
                    arrangement: row.arrangement,
                    link: row.link,
                    createdAt: row.created_at
                }));
                callback(reviews);
            }
        });
    } catch (err) {
        console.error(err);
        callback([]);
    }
}

function getAllAlbums(limit, offset, callback) {
    try {
        const sql = `
            SELECT *,
                   (SELECT SUM(personal_impressions + trendiness + text_and_lyrics_structure + melody_and_performance +
                               arrangement)
                    FROM reviews AS tracks
                    WHERE tracks.parent_id = albums.id) AS total_score
            FROM reviews AS albums
            WHERE albums.type = 'album'
              AND albums.parent_id IS NULL
            ORDER BY total_score DESC LIMIT ?
            OFFSET ?`;
        db.all(sql, [limit, offset], (err, rows) => {
            if (err) {
                console.error(err);
                callback([]);
            } else {
                const reviews = rows.map(row => ({
                    id: row.id,
                    title: row.release_name,
                    personalImpressions: row.personal_impressions,
                    trendiness: row.trendiness,
                    structure: row.text_and_lyrics_structure,
                    melodicPerformance: row.melody_and_performance,
                    arrangement: row.arrangement,
                    link: row.link,
                    createdAt: row.created_at
                }));
                callback(reviews);
            }
        });
    } catch (err) {
        console.error(err);
        callback([]);
    }
}

// Define a function to get the total number of reviews
function getTotalReviewsCount(callback) {
    const sql = `SELECT COUNT(*) AS count
                 FROM reviews
                 where type = 'single'
    `;
    db.get(sql, (err, row) => {
        if (err) {
            console.error(err);
            callback(0);
        } else {
            console.log(`Total reviews count: ${row.count}`);
            callback(null, row.count);
        }
    });
}

function getTotalAlbumReviewsCount(callback) {
    const sql = `SELECT COUNT(*) AS count
                 FROM reviews
                 where type = 'album' and parent_id is null`;
    db.get(sql, (err, row) => {
        if (err) {
            console.error(err);
            callback(0);
        } else {
            console.log(`Total reviews count: ${row.count}`);
            callback(null, row.count);
        }
    });
}

function deleteReview(reviewId) {
    const sql = `DELETE
                 FROM reviews
                 WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [reviewId], function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log(`Review with ID ${reviewId} deleted`);
                resolve();
            }
        });
    });
}

module.exports = {
    formatAlbumSmallDetails,
    deleteReview,
    getTotalAlbumReviewsCount,
    getAllAlbums,
    getReviewsByAlbum,
    formatAlbumDetails,
    formatAlbum,
    saveAlbum,
    saveReview,
    updateReview,
    getReviewById,
    formatReviewsDetails,
    formatReviewsSmall,
    getAllReviews,
    getTotalReviewsCount,
    updateReviewLink
}
