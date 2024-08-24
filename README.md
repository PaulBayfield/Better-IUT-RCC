<div align="center">

<img src="assets/img/logo.png" alt="IUT RCC" width="100" height="100" style="border-radius:20px"/>

# Better IUT RCC

Better IUT RCC est une extension navigateurs qui améliore l'interface de l'intranet de l'IUT RCC.

# L'extension 100% gratuite qui ne vous réclame pas des dons !

<a href="https://chromewebstore.google.com/detail/better-iut-rcc/jofahdhjofjoackgkaodimfhnbfkgnbj" target="_blank"><img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png" alt="Available in the Chrome Web Store"></a>
<a href="https://github.com/PaulBayfield/Better-IUT-RCC/releases/latest" target="_blank"><img src="https://blog.mozilla.org/addons/files/2015/11/get-the-addon.png" alt="Available in the Firefox Web Store"></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/leknkclokgeajllkbhnldadkapjmlhhf" target="_blank"><img src="https://user-images.githubusercontent.com/78568641/212470539-dd4d22a0-3af8-4fa7-9671-6df5b2e26a70.png" alt="Available in the Edge Web Store"></a>

</div>


## Fonctionnalités

- **Moyennes** : Affiche les moyennes de chaque matière directement sur la page d'accueil.
- **Notes** : Affiche les notes de chaque matière directement sur la page d'accueil et met en surbrillance les nouvelles notes.
- **Absences** : Affiche les absences de chaque matière directement sur la page d'accueil.
- **Style** : Améliore le style de l'intranet.
- **Interface** : Améliore l'interface de l'intranet en cachant notamment les éléments inutiles.
- **Validation** : Affiche si le semestre est validé ou non.
- **Bilan** : Affiche le bilan des notes et des absences.
- **Mode minimal** : Permet de cacher les éléments redondants.
- **Menus** : Affiches les menus des restaurants universitaires à proximité des IUT.
- **Graphiques** : Affiche des graphiques pour les moyennes.
- **Dark mode** : Permet de passer 100% de l'intranet en mode sombre (en fonction des paramètres de la machine).


## Prévisualisation

![homepage](./assets/preview/homepage.png)
![grades](./assets/preview/grades.png)
![crous](./assets/preview/crous.png)
![darkmode](./assets/preview/darkmode.png)


## Ajouter l'extension

- [Chrome Web Store](https://chrome.google.com/webstore/detail/better-iut-rcc/jofahdhjofjoackgkaodimfhnbfkgnbj)
- Firefox Add-ons • Installation manuelle requise, vous devez télécharger la dernière version, fichier .xpi [disponible ici]([https://github.com/PaulBayfield/Better-IUT-RCC/releases/latest])
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/leknkclokgeajllkbhnldadkapjmlhhf)

## Développement

Si vous souhaitez contribuer au développement de l'extension, voici comment procéder.

### Installation

Vous devez disposer des dernières versions LTS de node/npm (node v20, npm v10)

```bash
npm install
```

### Compilation

Pour compiler le projet en mode développement.

```bash
npm run dev
```

Pour compiler le projet en mode production.

```bash
npm run prod
```

Pour compiler le projet en mode production et générer une archive zip.

```bash
npm run zip
```

## Crédits

Réalisé par :
- [Paul Bayfield](https://github.com/PaulBayfield)
- [Simon Ledoux](https://github.com/simon511000)

Ce projet est une fusion de deux extensions déjà existante : 
- [Miaou Notes](https://github.com/simon511000/MiaouNotes), réalisé par [Simon Ledoux](https://github.com/simon511000)
- [Calcule ta moyenne](https://github.com/Enzo-Qlns/Iut-mark-calculator), réalisé par [Enzo-Qlns](https://github.com/Enzo-Qlns/Iut-mark-calculator)

## License

Ce projet est sous licence [MIT](/LICENSE).
