export const Utils = {
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
        return values.some(value => 
            value === undefined || 
            value === null || 
            (Array.isArray(value) && value.length === 0) || 
            (typeof value === 'string' && value.length === 0)
        );
    },

    /**
     * Fonction qui permet de sommer les valeurs d'un tableau
     * 
     * @param {Array<number>} arr
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
     * @param {number} num
     * @returns {boolean}
     * @example
     * checkEven(2); // true
     * checkEven(3); // false
     */
    checkEven: function (num) {
        return num % 2 === 0;
    },

    /**
     * Fonction qui arrondit un nombre à un nombre de chiffres après la virgule donné
     * 
     * @param {number} number
     * @param {number} decimalPlaces
     * @returns {number|string}
     * @example
     * roundValue(3.14159, 2); // 3.14
     * roundValue(3.14159, 3); // 3.142
     * roundValue('test', 2); // "Veuillez entrer des valeurs numériques valides."
     */
    roundValue: function (number, decimalPlaces) {
        if (isNaN(number) || isNaN(decimalPlaces)) {
            return "Veuillez entrer des valeurs numériques valides.";
        }
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(number * factor) / factor;
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
     * boolToString(true); // 'Oui'
     * boolToString(false); // 'Non'
     */
    boolToString: function (bool) {
        return bool ? 'Oui' : 'Non';
    },

    /**
     * Fonction qui permet de formater le code d'une matière
     * 
     * @param {string} subject
     * @returns {string}
     * @example
     * formatSubject('Matière 1'); // 'Matière 1'
     * formatSubject('Matière 1.1'); // 'Matière 1.1'
     * formatSubject('Matière 1.1.1'); // 'Matière 1.1'
     */
    formatSubject: function (subject) {
        let code = subject;
        if (subject.includes('.')) {
            code = subject.split('.');
            if (code.length === 2) {
                code = code[0] + '.' + code[1];
            } else {
                code = code[0] + '.' + code[2];
            }
        }

        return code;
    }
}
