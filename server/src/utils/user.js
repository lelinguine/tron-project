/**
 * Vérifie la validité d'un mot de passe.
 *
 * @export
 * @param {string} password - Le mot de passe à vérifier.
 * @return {boolean} `true` si le mot de passe est valide, `false` sinon.
 */
export function checkPassword(password) {
    return password.length >= 4 && password.length < 16;
}
