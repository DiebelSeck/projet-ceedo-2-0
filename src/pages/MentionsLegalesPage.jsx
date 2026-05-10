import LegalLayout from '../components/layout/LegalLayout';

export default function MentionsLegalesPage() {
  return (
    <LegalLayout
      title="Mentions Légales"
      intro="Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (L.C.E.N.), nous portons à la connaissance des utilisateurs et visiteurs du site projetceedo20.org les informations suivantes."
    >
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>projetceedo20.org</strong> est édité par l'organisation Projet Ceedo 2.0.
      </p>
      <ul>
        <li><strong>Responsable de la publication :</strong> Direction éditoriale Ceedo 2.0</li>
        <li><strong>Contact :</strong> editorial@projetceedo20.org</li>
        <li><strong>Siège social :</strong> Information en cours de finalisation.</li>
        <li><strong>Numéro d'identification :</strong> Information en cours de finalisation.</li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>
        Le site est hébergé par :
      </p>
      <ul>
        <li><strong>Hébergeur :</strong> Plesk / Infrastructure gérée.</li>
        <li><strong>Directus CMS :</strong> Hébergé sur infrastructure dédiée.</li>
      </ul>

      <h2>3. Propriété Intellectuelle</h2>
      <p>
        L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
      </p>
      <p>
        La reproduction de tout ou partie de ce site sur quelque support que ce soit est formellement interdite sauf autorisation expresse du directeur de la publication.
      </p>

      <h2>4. Crédits</h2>
      <p>
        <strong>Conception et réalisation :</strong> Équipe technique Projet Ceedo 2.0.
      </p>
      <p>
        <strong>Iconographie :</strong> Sources internes et banques d'images sous licence.
      </p>
    </LegalLayout>
  );
}
