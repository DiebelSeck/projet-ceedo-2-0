import LegalLayout from '../components/layout/LegalLayout';

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Politique des Cookies"
      intro="Le Projet Ceedo 2.0 utilise des cookies pour améliorer votre expérience de navigation et assurer le bon fonctionnement technique de la plateforme."
    >
      <h2>1. Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre ordinateur, mobile ou tablette lors de la visite d'un site. Ils ont pour but de collecter des informations relatives à votre navigation et de vous adresser des services adaptés à votre terminal.
      </p>

      <h2>2. Les cookies que nous utilisons</h2>
      <p>
        Nous utilisons principalement des cookies techniques nécessaires au fonctionnement du site :
      </p>
      <ul>
        <li><strong>Cookies de session :</strong> Permettent de rester connecté à votre espace auteur.</li>
        <li><strong>Cookies de sécurité :</strong> Aident à prévenir les fraudes et à sécuriser vos données.</li>
        <li><strong>Cookies de préférences :</strong> Mémorisent vos réglages d'affichage.</li>
      </ul>

      <h2>3. Cookies de mesure d'audience</h2>
      <p>
        Nous pouvons utiliser des outils de statistiques (type Matomo ou interne) configurés de manière anonyme pour comprendre l'utilisation de nos ressources sans identifier les individus.
      </p>

      <h2>4. Comment gérer les cookies ?</h2>
      <p>
        Vous pouvez choisir de désactiver les cookies via les réglages de votre navigateur. Notez cependant que la désactivation des cookies essentiels peut empêcher l'utilisation de certaines fonctionnalités du site, comme l'accès à l'espace de soumission d'articles.
      </p>
      <p>
        Pour plus d'informations sur la gestion des cookies, vous pouvez consulter le site de la CNIL.
      </p>

      <h2>5. Contact</h2>
      <p>
        Pour toute question concernant notre utilisation des cookies : <strong>admin@projetceedo20.org</strong>.
      </p>
    </LegalLayout>
  );
}
