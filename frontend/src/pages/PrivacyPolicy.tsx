import { Link } from "react-router-dom";
import LegalPageShell from "@/components/LegalPageShell";

const PrivacyPolicy = () => (
  <LegalPageShell
    title="Politique de confidentialité"
    updatedAt="28 octobre 2026"
    otherLink={{ to: "/conditions", label: "Conditions d'utilisation" }}
  >
    <p>
      La présente Politique de confidentialité décrit la manière dont Sifarah traite les données à caractère
      personnel lorsque vous consultez ou utilisez sa plateforme web et, le cas échéant, ses applications ou
      services associés. Elle présente les catégories de données susceptibles d&apos;être traitées, les finalités
      de ces traitements, les droits des personnes concernées et les moyens de les exercer.
    </p>

    <section>
      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est l&apos;éditeur de la plateforme <strong>Sifarah</strong>, service
        numérique de droit marocain destiné à l&apos;écosystème de l&apos;immobilier et de la construction.
      </p>
      <p>
        Pour toute question relative à cette Politique ou à vos données personnelles, vous pouvez nous écrire
        via la page{" "}
        <Link to="/contact">Contact</Link> ou à l&apos;adresse{" "}
        <a href="mailto:privacy@sifarah.ma">privacy@sifarah.ma</a>.
      </p>
      <p>
        Les traitements sont effectués dans le respect de la législation marocaine applicable, notamment la
        loi n° 09-08 relative à la protection des personnes physiques à l&apos;égard du traitement des données
        à caractère personnel, et sous le contrôle éventuel de la CNDP.
      </p>
    </section>

    <section>
      <h2>2. Données que nous pouvons traiter</h2>
      <p>
        Les catégories de données effectivement traitées dépendent des fonctionnalités utilisées et des
        informations que vous choisissez de fournir. Elles peuvent notamment comprendre :
      </p>
      <ul>
        <li>
          <strong>Données de compte :</strong> nom, prénom, adresse e-mail, numéro de téléphone, informations
          d&apos;authentification et type de compte.
        </li>
        <li>
          <strong>Données de profil professionnel :</strong> nom commercial ou raison sociale, activité,
          adresse professionnelle, ville, coordonnées, ICE ou RC lorsqu&apos;ils sont fournis, description,
          logo, site web, réseaux sociaux, certifications, expérience et réalisations.
        </li>
        <li>
          <strong>Données de vérification :</strong> documents et renseignements transmis volontairement pour
          confirmer une identité professionnelle ou la qualité de représentant, si une procédure de
          vérification est proposée.
        </li>
        <li>
          <strong>Données d&apos;équipe et de représentation :</strong> nom, fonction, e-mail, photo ou autres
          informations relatives aux collaborateurs que vous ajoutez, sous réserve de disposer des droits
          nécessaires.
        </li>
        <li>
          <strong>Contenus publiés :</strong> publications, photos, vidéos, descriptions, projets, produits,
          documents, commentaires, liens et autres informations que vous choisissez de publier.
        </li>
        <li>
          <strong>Données relatives aux projets :</strong> titre, description, localisation, statut,
          calendrier, caractéristiques, intervenants déclarés, documents, médias et opportunités.
        </li>
        <li>
          <strong>Données de contact et d&apos;échange :</strong> demandes de contact, réponses, messages ou
          pièces jointes, ainsi que les informations nécessaires à leur acheminement.
        </li>
        <li>
          <strong>Données de recherche et d&apos;utilisation :</strong> recherches, filtres, profils ou projets
          consultés, favoris, éléments enregistrés et interactions avec les fonctionnalités.
        </li>
        <li>
          <strong>Données techniques :</strong> adresse IP ou données dérivées, type d&apos;appareil,
          navigateur, système d&apos;exploitation, journaux de connexion, identifiants techniques et
          événements de sécurité.
        </li>
        <li>
          <strong>Données de localisation :</strong> ville ou zone géographique que vous indiquez, ou
          localisation approximative déduite de données techniques lorsque cette fonction est utilisée.
        </li>
        <li>
          <strong>Données de communication :</strong> préférences de notification et preuve de consentement ou
          de désinscription, le cas échéant.
        </li>
        <li>
          <strong>Données de paiement et de commande :</strong> informations relatives à une commande, une
          facture ou un paiement si des services payants sont proposés. Les données de carte bancaire peuvent
          être traitées directement par un prestataire de paiement.
        </li>
        <li>
          <strong>Données communiquées par des tiers :</strong> informations professionnelles accessibles au
          public, données communiquées par un représentant autorisé, ou informations concernant des
          collaborateurs ou contacts de référence que vous nous transmettez de manière légitime.
        </li>
      </ul>
    </section>

    <section>
      <h2>3. Finalités et bases légales</h2>
      <p>Selon les fonctionnalités activées, les données peuvent être traitées pour :</p>
      <ul>
        <li>
          <strong>Fourniture du service :</strong> comptes, profils, projets, publications, favoris, demandes
          de contact et autres fonctions demandées.
        </li>
        <li>
          <strong>Gestion des profils et projets :</strong> organiser, afficher, actualiser ou corriger les
          informations, et traiter les demandes de revendication, de correction ou de retrait.
        </li>
        <li>
          <strong>Communication :</strong> répondre aux demandes, envoyer des notifications liées au compte ou
          au service et informer des changements importants.
        </li>
        <li>
          <strong>Sécurité et prévention des abus :</strong> protéger les comptes, détecter les fraudes,
          traiter les signalements et maintenir l&apos;intégrité de la plateforme.
        </li>
        <li>
          <strong>Amélioration du service :</strong> diagnostiquer les erreurs, comprendre l&apos;utilisation
          et améliorer les performances.
        </li>
        <li>
          <strong>Services payants :</strong> traiter les commandes, paiements, factures et demandes
          d&apos;assistance, le cas échéant.
        </li>
        <li>
          <strong>Obligations légales :</strong> répondre aux demandes licites des autorités et conserver les
          informations requises par la loi.
        </li>
      </ul>
      <p>
        La base légale dépend de la finalité : exécution d&apos;un contrat ou de mesures précontractuelles,
        obligation légale, consentement lorsque celui-ci est requis, ou intérêt légitime de Sifarah après mise
        en balance des droits et libertés concernés. Lorsqu&apos;un traitement repose sur le consentement, vous
        pouvez le retirer pour l&apos;avenir sans affecter la licéité du traitement antérieur.
      </p>
    </section>

    <section>
      <h2>4. Sources des données</h2>
      <p>Les données peuvent provenir :</p>
      <ul>
        <li>directement de vous (compte, profil, publication, contact) ;</li>
        <li>de votre utilisation de la plateforme ;</li>
        <li>de l&apos;entreprise ou de l&apos;organisation que vous représentez ;</li>
        <li>de sources professionnelles accessibles au public, lorsque la collecte est licite et pertinente ;</li>
        <li>de partenaires ou d&apos;autres utilisateurs, sous réserve des droits applicables ;</li>
        <li>de prestataires d&apos;authentification, de paiement ou de services intégrés effectivement utilisés.</li>
      </ul>
    </section>

    <section>
      <h2>5. Utilisation et affichage des informations professionnelles</h2>
      <p>
        Sifarah est une plateforme de découverte professionnelle dans les secteurs de l&apos;immobilier et de
        la construction. Certaines informations professionnelles peuvent être affichées à d&apos;autres
        utilisateurs afin de permettre la recherche, la découverte de professionnels, la consultation de
        projets ou la prise de contact.
      </p>
      <p>
        Les informations publiées comme publiques peuvent être consultées, partagées ou reprises par des
        tiers. Avant de publier, assurez-vous d&apos;y être autorisé et évitez d&apos;inclure des données
        personnelles ou confidentielles inutiles.
      </p>
      <p>
        Certaines fiches peuvent provenir de sources accessibles au public ou être communiquées par des
        tiers. Une mention sur la plateforme ne signifie pas nécessairement que la personne ou l&apos;entreprise
        concernée a créé, confirmé ou approuvé la fiche. Les personnes concernées peuvent demander une
        correction, une mise à jour, une restriction d&apos;affichage ou l&apos;examen d&apos;un retrait via{" "}
        <Link to="/contact">Contact</Link>.
      </p>
    </section>

    <section>
      <h2>6. Destinataires des données</h2>
      <p>Les données personnelles peuvent être accessibles, dans la mesure nécessaire :</p>
      <ul>
        <li>aux personnes habilitées au sein de Sifarah (gestion, sécurité, assistance, obligations légales) ;</li>
        <li>aux autres utilisateurs, lorsque vous publiez des informations visibles ;</li>
        <li>aux prestataires techniques ou partenaires nécessaires au fonctionnement du service ;</li>
        <li>aux prestataires de paiement, si des paiements sont proposés ;</li>
        <li>aux autorités compétentes lorsque la communication est légalement requise ;</li>
        <li>
          à un acquéreur ou successeur en cas de réorganisation, fusion ou cession, sous réserve des garanties
          légales applicables.
        </li>
      </ul>
    </section>

    <section>
      <h2>7. Transferts de données hors du Maroc</h2>
      <p>
        Les données peuvent être hébergées ou traitées hors du Maroc si l&apos;infrastructure ou les
        prestataires utilisés se trouvent à l&apos;étranger. Tout transfert international est encadré
        conformément à la législation applicable, notamment aux exigences marocaines en matière de protection
        des données personnelles.
      </p>
    </section>

    <section>
      <h2>8. Durée de conservation</h2>
      <p>
        Sifarah conserve les données uniquement pendant une durée justifiée par les finalités du traitement,
        les besoins de sécurité, la gestion de la relation utilisateur et les obligations légales. Les durées
        peuvent varier selon qu&apos;il s&apos;agit de données de compte, de profils, de contenus, de messages,
        de journaux de sécurité, de factures ou de preuves de consentement.
      </p>
      <p>
        Lorsque les données ne sont plus nécessaires, elles sont supprimées, anonymisées ou archivées lorsque
        la loi le permet ou l&apos;exige. La suppression d&apos;un compte n&apos;entraîne pas nécessairement
        l&apos;effacement immédiat de toutes les copies de sauvegarde, des contenus déjà partagés par des
        tiers ou des données devant être conservées pour une obligation légale ou un litige.
      </p>
    </section>

    <section>
      <h2>9. Vos droits</h2>
      <p>
        Sous réserve des conditions et limites prévues par la législation applicable, notamment la loi n°
        09-08, vous pouvez disposer notamment des droits suivants :
      </p>
      <ul>
        <li>
          <strong>Droit d&apos;accès</strong> — savoir si des données vous concernant sont traitées et obtenir
          les informations légalement accessibles ;
        </li>
        <li>
          <strong>Droit de rectification</strong> — demander la correction de données inexactes ou
          incomplètes ;
        </li>
        <li>
          <strong>Droit d&apos;opposition</strong> — vous opposer à certains traitements lorsque les conditions
          légales sont réunies ;
        </li>
        <li>
          <strong>Droit de suppression</strong> — demander l&apos;effacement lorsque les conditions légales
          sont réunies ;
        </li>
        <li>
          <strong>Retrait du consentement</strong> — pour les traitements reposant sur votre consentement ;
        </li>
        <li>tout autre droit prévu par la législation applicable à votre situation.</li>
      </ul>
      <p>
        Pour exercer vos droits, contactez-nous via{" "}
        <Link to="/contact">Contact</Link> ou{" "}
        <a href="mailto:privacy@sifarah.ma">privacy@sifarah.ma</a>, en précisant votre demande et les
        informations nécessaires pour vous identifier de manière proportionnée. Sifarah peut demander des
        éléments supplémentaires pour vérifier l&apos;identité ou l&apos;autorité du demandeur.
      </p>
    </section>

    <section>
      <h2>10. Réclamation auprès de l&apos;autorité de contrôle</h2>
      <p>
        Si vous estimez que vos données sont traitées en violation de la réglementation applicable, vous
        pouvez saisir la <strong>Commission Nationale de contrôle de la protection des Données à caractère
        Personnel (CNDP)</strong> au Maroc, selon les procédures qu&apos;elle met à disposition.
      </p>
    </section>

    <section>
      <h2>11. Suppression du compte et des données</h2>
      <p>
        Lorsque la fonction est disponible, vous pouvez supprimer votre compte depuis les paramètres, ou
        adresser une demande via <Link to="/contact">Contact</Link> depuis l&apos;adresse associée au compte.
      </p>
      <p>
        La suppression entraîne la suppression ou l&apos;anonymisation des données personnelles qui ne sont
        plus nécessaires, sous réserve des délais techniques, des sauvegardes, des contenus déjà copiés par
        des tiers et des obligations légales de conservation.
      </p>
    </section>

    <section>
      <h2>12. Données de tiers que vous nous communiquez</h2>
      <p>
        Si vous fournissez des données concernant d&apos;autres personnes (collaborateurs, représentants,
        contacts professionnels), vous devez disposer d&apos;un fondement légitime et leur fournir les
        informations requises par la loi lorsque cela vous incombe. Ne communiquez pas de coordonnées
        privées, documents d&apos;identité ou autres données de tiers sans autorisation appropriée.
      </p>
    </section>

    <section>
      <h2>13. Permissions de l&apos;appareil</h2>
      <p>
        Si Sifarah propose des fonctions nécessitant l&apos;accès à l&apos;appareil photo, aux photos, aux
        fichiers ou à d&apos;autres permissions, ces accès ne sont activés que pour les fonctionnalités
        nécessaires et conformément aux autorisations de votre appareil.
      </p>
    </section>

    <section>
      <h2>14. Outils automatisés et recommandations</h2>
      <p>
        Si Sifarah propose des outils de recherche, de recommandation ou de classement, les résultats peuvent
        être incomplets ou inexacts et doivent être vérifiés avant toute décision commerciale, technique,
        juridique ou financière. Lorsque des données personnelles sont utilisées à ces fins, les droits
        décrits dans la présente Politique s&apos;appliquent.
      </p>
    </section>

    <section>
      <h2>15. Cookies et traceurs</h2>
      <p>
        Sifarah utilise des cookies first-party nécessaires au fonctionnement et à la mesure d&apos;audience,
        notamment un identifiant anonyme de visiteur (<code>sifarah_vid</code>) pour reconnaître les retours
        sur la plateforme, et le cas échéant un cookie de coordonnées invité (<code>sifarah_vc</code>) pour
        faciliter les interactions (favoris, demandes d&apos;infos). Ces cookies sont déposés avec une durée
        limitée, en SameSite=Lax, et peuvent être accompagnés de Secure sur HTTPS. Vous pouvez les supprimer
        ou les bloquer via les paramètres de votre navigateur ; certaines fonctionnalités pourront alors être
        moins pratiques.
      </p>
    </section>

    <section>
      <h2>16. Sécurité des données</h2>
      <p>
        Sifarah met en œuvre des mesures techniques et organisationnelles proportionnées aux risques afin de
        protéger les données contre l&apos;accès non autorisé, la perte, l&apos;altération ou la divulgation.
        Aucune méthode de transmission ou de stockage n&apos;est totalement sûre. En cas d&apos;incident
        affectant les données personnelles, Sifarah prendra les mesures requises par la législation
        applicable.
      </p>
    </section>

    <section>
      <h2>17. Public concerné</h2>
      <p>
        Sifarah s&apos;adresse principalement aux acteurs professionnels de l&apos;immobilier et de la
        construction, ainsi qu&apos;aux personnes qui utilisent ses services. Les règles d&apos;âge et
        d&apos;éligibilité sont précisées dans les{" "}
        <Link to="/conditions">Conditions d&apos;utilisation</Link>.
      </p>
    </section>

    <section>
      <h2>18. Modification de la présente Politique</h2>
      <p>
        Sifarah peut modifier cette Politique afin de refléter l&apos;évolution de ses services, de ses
        traitements ou de la réglementation. La version en vigueur est publiée sur la plateforme avec sa date
        de mise à jour. En cas de modification substantielle, Sifarah informera les utilisateurs par un moyen
        approprié lorsque cela est nécessaire. Nous vous invitons à consulter régulièrement cette page.
      </p>
    </section>
  </LegalPageShell>
);

export default PrivacyPolicy;
