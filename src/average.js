import { Utils } from "./utils";

class Average {
    constructor() {
        this.gradesData = {};
        this.subjectData = {};
        this.averageGradeData = {};
        this.averageSubjectData = {};
        this.proficiencies = [];

        this.loadGrades();
    }

    /**
     * Fonction pour charger les notes et les matières.
     * 
     * @returns {void} - Aucune valeur de retour.
     * 
     * @example
     * loadGrades();
     * 
     */
    loadGrades() {
        const subjects = document.querySelectorAll("#mainContent > div.row > div:nth-child(4) > div > div > table > tbody tr");
        const grades = document.querySelectorAll("#mainContent > div.row > div:nth-child(3) > div > div > table > tbody tr");

        // Récupérer les matières et les coefficients
        for (const subject of subjects) {
            let subjectCode = subject.children[0].textContent.split('|')[0].trim();
            let subjectName = subject.children[0].textContent.split('|')[1].trim();

            let subjectFull = subjectCode + ' • ' + subjectName;

            let subjectCoefficients = [];
            for (const ue of subject.children[1].children) {
                let name = ue.textContent.split('(')[0].trim();
                let coefficient = parseFloat(ue.textContent.match(/\((.*?)\)/)[1]);

                if (coefficient > 0) {
                    subjectCoefficients.push({
                        name: name,
                        coefficient: coefficient
                    });

                    if (!this.proficiencies.includes(name))
                        this.proficiencies.push(name);
                };
            };

            this.subjectData[subjectCode] = {
                full: subjectFull,
                name: subjectName,
                coefficients: subjectCoefficients
            };
        };

        // Récupérer les notes et les coefficients
        for (const grade of grades) {
            if (grade.children.length === 1) {
                console.warn("[Better IUT RCC] Aucune note n'a été saisie");
                continue;
            }

            let subject = grade.children[0].textContent.trim();
            let gradeValue = Number.parseFloat(grade.children[4].children[0].textContent.replace(',', '.'));
            let coefficient = Number.parseFloat(grade.children[5].textContent.replace(',', '.'));

            if (!this.gradesData.hasOwnProperty(subject)) {
                this.gradesData[subject] = []
            };

            if (isNaN(gradeValue)) {
                gradeValue = -1;
            }

            this.gradesData[subject].push({
                grade: gradeValue,
                coefficient: coefficient
            });

            if (this.subjectData.hasOwnProperty(subject)) {
                this.gradesData[subject].name = this.subjectData[subject].name;
            };

            if (!this.subjectData.hasOwnProperty(subject)) {
                this.subjectData[subject] = {
                    full: subject,
                    name: subject,
                    coefficients: []
                };
            };
        };

        // Calculer les moyennes des matières
        for (const subject in this.subjectData) {
            let subjectGrades = [];
            let subjectCoefficients = [];

            if (this.gradesData.hasOwnProperty(subject)) {
                for (const gradeData of this.gradesData[subject]) {
                    subjectGrades.push(gradeData.grade);
                    subjectCoefficients.push(gradeData.coefficient);
                }
            };

            this.averageGradeData[subject] = this.calculateAverage(subjectGrades, subjectCoefficients);
        };

        // Calculer les moyennes des compétences
        for (const proficiency of this.proficiencies) {
            let proficiencyGrades = [];
            let proficiencyCoefficients = [];

            for (const grade in this.gradesData) {
                for (const g of this.gradesData[grade]) {
                    for (const proficiencyData of this.subjectData[grade].coefficients) {
                        if (proficiencyData.name === proficiency && g.grade >= 0) {
                            proficiencyGrades.push(g.grade);
                            proficiencyCoefficients.push(proficiencyData.coefficient);
                        };
                    }
                }
            }

            this.averageSubjectData[proficiency] = this.calculateAverage(proficiencyGrades, proficiencyCoefficients);
        };

        // Trier les données par ordre alphabétique
        this.gradesData = Object.fromEntries(Object.entries(this.gradesData).sort());
        this.subjectData = Object.fromEntries(Object.entries(this.subjectData).sort());
        this.averageGradeData = Object.fromEntries(Object.entries(this.averageGradeData).sort());
        this.averageSubjectData = Object.fromEntries(Object.entries(this.averageSubjectData).sort());
        this.proficiencies = this.proficiencies.sort();
    }


    /**
     * Fonction pour calculer la moyenne.
     * 
     * @param {number[]} grades - Les notes à utiliser pour calculer la moyenne.
     * @param {number[]} coefficients - Les coefficients à utiliser pour calculer la moyenne.
     * @returns {number} - La moyenne calculée.
     * 
     * @example
     * calculateAverage([10, 12, 14], [1, 2, 3]); // Résultat : 12.4
     * 
     */
    calculateAverage(grades, coefficients) {
        let numerator = 0;
        let denominator = 0;
        let validGrade = false;

        grades.forEach((grade, index) => {
            if (grade >= 0) {
                numerator += grade * coefficients[index];
                denominator += coefficients[index];
                validGrade = true;
            }
        });

        return Utils.roundValue((validGrade ? (numerator / denominator) : -1), 2);
    }


    /**
     * Fonction pour calculer la moyenne d'une matière.
     * 
     * @param {string} subject - La matière pour laquelle calculer la moyenne.
     * @returns {number} - La moyenne calculée.
     * 
     * @example
     * subjectAverage('Matière 1'); // Résultat : 12.4
     * 
     */
    subjectAverage(subject) {
        return this.averageGradeData[subject];
    }


    /**
     * Fonction pour obtenir le nom complet d'une matière.
     * 
     * @param {string} subject - La matière pour laquelle obtenir le nom complet.
     * @returns {string} - Le nom complet de la matière.
     * 
     * @example
     * subjectName('Matière 1'); // Résultat : 'Matière 1'
     * 
     */
    subjectName(subject) {
        return this.subjectData[subject].full;
    }


    /**
     * Fonction pour calculer la moyenne générale.
     * 
     * @returns {number} - La moyenne générale calculée.
     * 
     * @example
     * overallAverage(); // Résultat : 12.4
     * 
     */
    overallAverage() {
        return this.calculateAverage(Object.values(this.averageGradeData), Object.values(this.averageGradeData).map(() => 1));
    }


    /**
     * Fonction pour calculer la moyenne d'une compétence.
     * 
     * @returns {number} - La moyenne calculée.
     * 
     * @example
     * proficiencyAverage('Compétence 1'); // Résultat : 12.4
     */
    overallSubjectsAverage() {
        return this.calculateAverage(Object.values(this.averageSubjectData), Object.values(this.averageSubjectData).map(() => 1));
    }


    /**
     * Fonction pour vérifier si le semestre est valide.
     * 
     * @returns {boolean} - La validité du semestre.
     * 
     * @example
     * isValidSemester(); // Résultat : true
     * 
     */
    isValidSemester() {
        let below10Count = 0;
        let below8Count = 0;

        for (const grade in this.averageSubjectData) {
            if (this.averageSubjectData[grade] < 10) {
                below10Count++;
            }

            if (this.averageSubjectData[grade] < 8) {
                below8Count++;
            }
        }
    
        return below10Count <= 2 && below8Count === 0;
    }
}

export { Average };
