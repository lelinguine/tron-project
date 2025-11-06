/**
 * Parse le corps d'une requête HTTP entrante.
 *
 * @export
 * @param {import('http').IncomingMessage} req - La requête entrante.
 * @return {Promise<string>} Une promesse qui résout les données analysées.
 */
export function parseBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];

        req.on('data', (chunk) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            try {
                const body = Buffer.concat(chunks).toString();
                resolve(body);
            } catch (error) {
                reject(error);
            }
        });

        req.on('error', reject);
    });
}
