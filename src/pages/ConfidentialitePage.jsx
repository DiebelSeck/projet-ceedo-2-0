import LegalLayout from '../components/layout/LegalLayout';

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de Confidentialité"
      intro="La protection de vos données personnelles est une priorité pour le Projet Ceedo 2.0. Cette politique vous informe sur la manière dont nous collectons et traitons vos informations."
    >
      <h2>1. Collecte des données</h2>
      <p>
        Nous collectons des informations lorsque vous utilisez notre plateforme, notamment lors de la création d'un compte auteur, de la soumission d'un article ou de l'utilisation de nos formulaires de contact.
      </p>
      <ul>
        <li><strong>Données d'identification :</strong> Nom, prénom, adresse e-mail.</li>
        <li><strong>Données de profil :</strong> Biographie, spécialités académiques (pour les auteurs).</li>
        <li><strong>Données techniques :</strong> Adresse IP, cookies de session.</li>
      </ul>

      <h2>2. Utilisation des informations</h2>
      <p>
        Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
      </p>
      <ul>
        <li>Gérer votre espace auteur et vos publications.</li>
        <li>Améliorer le service client et vos besoins de prise en charge.</li>
        <li>Vous contacter par e-mail concernant l'état de vos soumissions.</li>
        <li>Administrer des concours, des promotions ou des enquêtes.</li>
      </ul>

      <h2>3. Confidentialité du commerce en ligne</h2>
      <p>
        Nous sommes les seuls propriétaires des informations collectées sur ce site. Vos informations personnelles ne seront pas vendues, échangées, transférées, ou données à une autre société pour n'importe quelle raison, sans votre consentement.
      </p>

      <h2>4. Divulgation à des tiers</h2>
      <p>
        Nous ne vendons, n'échangeons et ne transférons pas vos informations personnelles identifiables à des tiers. Cela ne comprend pas les tierce parties de confiance qui nous aident à exploiter notre site Web, tant que ces parties conviennent de garder ces informations confidentielles.
      </p>

      <h2>5. Protection des informations</h2>
      <p>
        Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons un cryptage à la pointe de la technologie pour protéger les informations sensibles transmises en ligne.
      </p>

      <h2>6. Vos droits (RGPD)</h2>
      <p>
        Conformément au Règlement Général sur la Protection des Données, vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données. Vous pouvez exercer ces droits en contactant : <strong>admin@projetceedo20.org</strong>.
      </p>
    </LegalLayout>
  );
}
