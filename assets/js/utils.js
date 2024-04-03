const Utils = {
    /**
     * Fonction permettant de vérifier si une ou plusieurs valeurs sont vides
     * 
     * @param  {...any} values 
     * @returns {boolean}
     * @example
     * isEmpty(''); // true
     * isEmpty(null); // true
     * isEmpty(undefined); // true
     * isEmpty([]); // true
     * isEmpty('test'); // false
     */
    isEmpty: function (...values) {
        if (values.length === 0)
            return true;
        for (let index = 0; index < values.length; index++) {
            const value = values[index];
            const isArray = Array.isArray(value);
            let bool = (undefined === value || null === value || (isArray && value.length === 0) || (typeof value === 'string' && value.length === 0));
            if (bool)
                return true;
        }
        return false;
    },

    /**
     * Fonction qui permet de sommer les valeurs d'un tableau
     * 
     * @param {Array} arr
     * @returns {number}
     * @example
     * sumArray([1, 2, 3, 4, 5]); // 15
     */
    sumArray: function (arr) {
        return arr.reduce((a, b) => a + b, 0);
    },

    /**
     * Fonction qui permet de vérifier si un nombre est pair
     * 
     * @param {number} nbr
     * @returns {boolean}
     * @example
     * checkPair(2); // true
     * checkPair(3); // false
     */
    checkPair: function (nbr) {
        return nbr % 2 == 0;
    },

    /**
     * Fonction qui arrondit un nombre à un nombre de chiffres après la virgule donné
     * 
     * @param {number} nombre
     * @param {number} chiffresApresVirgule
     * @returns {number|string}
     * @example
     * roundValue(3.14159, 2); // 3.14
     * roundValue(3.14159, 3); // 3.142
     * roundValue('test', 2); // "Veuillez entrer des valeurs numériques valides."
     */
    roundValue: function (nombre, chiffresApresVirgule) {
        if (isNaN(nombre) || isNaN(chiffresApresVirgule)) {
            return "Veuillez entrer des valeurs numériques valides.";
        }
        const factor = Math.pow(10, chiffresApresVirgule);
        const nombreArrondi = Math.round(nombre * factor) / factor;
        return Number.parseFloat(nombreArrondi);
    },

    /**
     * Fonction qui permet de supprimer une valeur d'un tableau
     * 
     * @param {Array} arr
     * @param {any} value
     * @returns {Array}
     * @example
     * deleteArrayValue([1, 2, 3, 4, 5], 3); // [1, 2, 4, 5]
     */
    deleteArrayValue: function (arr, value) {
        return arr.filter(x => x !== value);
    },

    /**
     * Fonction qui permet de convertir un booléen en chaîne de caractères
     * 
     * @param {boolean} bool
     * @returns {string}
     * @example
     * boolToValue(true); // 'Oui'
     * boolToValue(false); // 'Non'
     */
    boolToValue: function (bool) {
        return bool ? 'Oui' : 'Non';
    },

    /**
     * Fonction qui permet de calculer la moyenne pondérée
     * 
     * @param {Array} notes
     * @returns {number}
     * @example
     * calculateAverageWeight([{note: 10, coef: 2}, {note: 15, coef: 3}]); // 13
     */
    calculateAverageWeight: function (notes) {
        let sommeProduits = 0;
        let sommeCoefficients = 0;

        notes.forEach(item => {
            sommeProduits += item.note * item.coef;
            sommeCoefficients += item.coef;
        });

        return sommeProduits / sommeCoefficients;
    }
}