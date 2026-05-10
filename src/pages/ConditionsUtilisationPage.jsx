import LegalLayout from '../components/layout/LegalLayout';

export default function ConditionsUtilisationPage() {
  return (
    <LegalLayout
      title="Conditions Générales d'Utilisation"
      intro="Les présentes conditions générales d'utilisation (dites « CGU ») ont pour objet l'encadrement juridique des modalités de mise à disposition du site et des services par le Projet Ceedo 2.0 et de définir les conditions d’accès et d’utilisation des services par « l’Utilisateur »."
    >
      <h2>1. Accès au site</h2>
      <p>
        Le site <strong>projetceedo20.org</strong> permet à l'Utilisateur un accès gratuit aux services suivants :
      </p>
      <ul>
        <li>Consultation d'articles et de ressources documentaires.</li>
        <li>Accès à l'espace auteur (soumis à authentification).</li>
        <li>Consultation des programmes de l'Académie.</li>
      </ul>
      <p>
        Le site est accessible gratuitement en tout lieu à tout Utilisateur ayant un accès à Internet. Tous les frais supportés par l'Utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.
      </p>

      <h2>2. Responsabilité de l'Éditeur</h2>
      <p>
        Tout dysfonctionnement du serveur ou du réseau ne peut engager la responsabilité de l'Éditeur. De même, la responsabilité du site ne peut être engagée en cas de force majeure ou du fait imprévisible et insurmontable d'un tiers.
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        Les marques, logos, signes ainsi que tous les contenus du site (textes, images, son…) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
      </p>
      <p>
        L'Utilisateur doit solliciter l'autorisation préalable du site pour toute reproduction, publication, copie des différents contenus.
      </p>

      <h2>4. Obligations de l'Auteur</h2>
      <p>
        Tout Utilisateur ayant un compte auteur s'engage à soumettre des contenus originaux, respectant la charte éditoriale du Projet Ceedo 2.0 et ne portant pas atteinte aux droits des tiers. L'Auteur reste responsable de ses propos.
      </p>

      <h2>5. Évolution des conditions</h2>
      <p>
        Le site se réserve le droit de modifier les clauses de ces CGU à tout moment et sans justification.
      </p>

      <h2>6. Droit applicable</h2>
      <p>
        La législation française s'applique au présent contrat. En cas d'absence de résolution amiable d'un litige né entre les parties, les tribunaux français seront seuls compétents pour en connaître.
      </p>
    </LegalLayout>
  );
}
