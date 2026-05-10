import LegalLayout from '../components/layout/LegalLayout';

export default function AccessibilitePage() {
  return (
    <LegalLayout
      title="Déclaration d'Accessibilité"
      intro="Le Projet Ceedo 2.0 s'engage à rendre ses services numériques accessibles, conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005."
    >
      <h2>1. État de conformité</h2>
      <p>
        Le site <strong>projetceedo20.org</strong> est en cours d'audit d'accessibilité. Son état de conformité avec le Référentiel Général d'Amélioration de l'Accessibilité (RGAA) est : <strong>en cours de finalisation</strong>.
      </p>

      <h2>2. Résultats des tests</h2>
      <p>
        L'audit de conformité est planifié pour l'année en cours. Nous nous efforçons d'appliquer les principes de conception inclusive :
      </p>
      <ul>
        <li>Contrastes de couleurs élevés pour une meilleure lisibilité.</li>
        <li>Navigation au clavier optimisée.</li>
        <li>Hiérarchie sémantique des titres (H1, H2, H3).</li>
        <li>Alternatives textuelles pour les images informatives.</li>
      </ul>

      <h2>3. Retour d'information et contact</h2>
      <p>
        Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez nous contacter pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme :
      </p>
      <ul>
        <li>Envoyez un message à : <strong>admin@projetceedo20.org</strong></li>
      </ul>

      <h2>4. Voies de recours</h2>
      <p>
        Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.
      </p>
    </LegalLayout>
  );
}
