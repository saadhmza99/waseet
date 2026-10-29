import { Link } from "react-router-dom";
import LegalPageShell from "@/components/LegalPageShell";

const TermsOfUse = () => (
  <LegalPageShell
    title="Conditions d'utilisation"
    updatedAt="28 octobre 2026"
    otherLink={{ to: "/confidentialite", label: "Politique de confidentialité" }}
  >
    <p>
      Sifarah (ci-après la « Plateforme ») est un service numérique destiné à faciliter la découverte des
      acteurs professionnels de l&apos;immobilier et de la construction au Maroc, la consultation de leurs
      profils, le suivi de leurs actualités, la découverte de projets et d&apos;opportunités, ainsi que les
      échanges et mises en relation entre professionnels.
    </p>
    <p>
      Les présentes Conditions générales d&apos;utilisation (les « Conditions ») régissent l&apos;accès à
      Sifarah et son utilisation par tout visiteur, titulaire de compte, professionnel, entreprise, promoteur,
      fournisseur, partenaire ou autre utilisateur (l&apos;« Utilisateur »).
    </p>
    <p>
      En accédant à la Plateforme, en créant un compte ou en utilisant une fonctionnalité soumise aux
      présentes Conditions, l&apos;Utilisateur reconnaît en avoir pris connaissance et les accepter. S&apos;il
      ne les accepte pas, il doit cesser d&apos;utiliser les fonctionnalités concernées.
    </p>

    <section>
      <h2>1. Éditeur et contact</h2>
      <p>
        La Plateforme est éditée par <strong>Sifarah</strong>, service numérique opéré au Maroc.
      </p>
      <ul>
        <li>
          Contact général : page <Link to="/contact">Contact</Link> ou{" "}
          <a href="mailto:contact@sifarah.ma">contact@sifarah.ma</a>
        </li>
        <li>
          Données personnelles :{" "}
          <a href="mailto:privacy@sifarah.ma">privacy@sifarah.ma</a> — voir aussi la{" "}
          <Link to="/confidentialite">Politique de confidentialité</Link>
        </li>
        <li>
          Signalement de contenu ou de droits : via <Link to="/contact">Contact</Link> en précisant
          « Signalement »
        </li>
      </ul>
    </section>

    <section>
      <h2>2. Éligibilité et création d&apos;un compte</h2>
      <p>
        L&apos;Utilisateur doit avoir la capacité juridique nécessaire pour accepter les présentes
        Conditions. Les comptes professionnels doivent être créés ou utilisés par une personne autorisée à
        agir pour le compte de l&apos;entreprise ou de l&apos;organisation concernée.
      </p>
      <p>Pour créer ou utiliser un compte, l&apos;Utilisateur s&apos;engage à :</p>
      <ul>
        <li>fournir des informations exactes, licites et suffisamment à jour ;</li>
        <li>corriger les informations devenues inexactes ;</li>
        <li>protéger ses identifiants et ne pas permettre à une personne non autorisée d&apos;utiliser son compte ;</li>
        <li>informer Sifarah en cas d&apos;accès non autorisé suspecté ;</li>
        <li>ne pas usurper l&apos;identité d&apos;une personne ou d&apos;une organisation ;</li>
        <li>ne pas utiliser le compte d&apos;un tiers sans autorisation.</li>
      </ul>
      <p>
        L&apos;Utilisateur est responsable des actions réalisées au moyen de son compte, sous réserve des
        dispositions légales applicables. Une vérification éventuelle par Sifarah ne constitue pas une
        garantie de solvabilité, de compétence ou de qualité des prestations.
      </p>
    </section>

    <section>
      <h2>3. Fonctionnalités de Sifarah</h2>
      <p>Selon le service disponible, la Plateforme peut notamment proposer :</p>
      <ul>
        <li>la recherche et la découverte de professionnels, entreprises, promoteurs, bureaux d&apos;études, architectes, entreprises de construction, sous-traitants et fournisseurs ;</li>
        <li>des profils professionnels (activité, coordonnées, réalisations, liens) ;</li>
        <li>des fiches de projets (informations générales, intervenants, médias, documents, étapes, opportunités) ;</li>
        <li>un fil d&apos;actualités et des publications professionnelles ;</li>
        <li>le suivi de profils, l&apos;enregistrement ou le partage de contenus, et la prise de contact ;</li>
        <li>des fiches de produits, fournisseurs ou solutions pour le secteur ;</li>
        <li>des opportunités et mécanismes de mise en relation.</li>
      </ul>
      <p>
        Toutes les fonctionnalités ne sont pas nécessairement activées à tout moment. Leur disponibilité peut
        dépendre du type de compte, de la zone géographique ou d&apos;une offre particulière.
      </p>
    </section>

    <section>
      <h2>4. Règles d&apos;utilisation et comportements interdits</h2>
      <p>Il est notamment interdit de :</p>
      <ul>
        <li>publier des informations fausses, trompeuses ou diffamatoires ;</li>
        <li>usurper l&apos;identité d&apos;une personne, d&apos;une entreprise ou d&apos;un organisme ;</li>
        <li>porter atteinte aux droits de propriété intellectuelle, à la vie privée ou aux secrets d&apos;affaires ;</li>
        <li>publier des coordonnées personnelles ou documents confidentiels sans fondement légitime ;</li>
        <li>harceler, menacer, discriminer ou abuser d&apos;un autre utilisateur ;</li>
        <li>publier du contenu illégal, frauduleux, haineux ou interdit par la loi ;</li>
        <li>pratiquer le spam ou détourner les outils de contact ;</li>
        <li>manipuler artificiellement la visibilité, les statistiques ou les recommandations ;</li>
        <li>introduire un virus, contourner la sécurité ou perturber le fonctionnement de Sifarah ;</li>
        <li>extraire ou collecter systématiquement des données par robots ou scripts sans autorisation écrite ;</li>
        <li>revendre ou exploiter commercialement les données, profils ou bases de Sifarah sans autorisation ;</li>
        <li>utiliser la marque ou le logo Sifarah de manière à suggérer un partenariat inexistant.</li>
      </ul>
    </section>

    <section>
      <h2>5. Profils professionnels et qualité des informations</h2>
      <p>
        Les Utilisateurs qui créent, revendiquent ou administrent un profil professionnel sont responsables
        des informations soumises et doivent disposer des autorisations nécessaires. Sifarah peut demander une
        correction ou une preuve, limiter la visibilité d&apos;un profil, refuser une publication ou suspendre
        un compte lorsque cela est raisonnablement nécessaire.
      </p>
      <p>
        La présence d&apos;un professionnel dans les résultats, un profil renseigné ou un badge ne signifie
        pas que Sifarah certifie ses qualifications, sa situation juridique ou la qualité de ses travaux, sauf
        mention expresse d&apos;une vérification réellement effectuée.
      </p>
    </section>

    <section>
      <h2>6. Projets et informations relatives aux opérations</h2>
      <p>
        Les fiches de projets peuvent provenir de l&apos;Utilisateur, de partenaires, de sources publiques ou
        d&apos;autres sources pertinentes. Sauf indication expresse, la présence d&apos;un nom sur une fiche
        ne signifie pas nécessairement que la personne ou l&apos;entreprise a confirmé sa participation.
      </p>
      <p>
        Les fiches peuvent être incomplètes, anciennes ou susceptibles d&apos;évoluer. Statuts, calendriers,
        intervenants et documents doivent être confirmés auprès de la source responsable avant toute décision
        commerciale, financière ou technique. En cas d&apos;erreur, contactez Sifarah via{" "}
        <Link to="/contact">Contact</Link> pour demander une correction ou un retrait.
      </p>
    </section>

    <section>
      <h2>7. Visibilité publique et documents</h2>
      <p>
        Les contenus publiés comme publics peuvent être consultés, partagés ou indexés par des tiers.
        Vérifiez les réglages de visibilité avant de publier des informations sensibles. Une limitation de
        visibilité n&apos;est pas une garantie de confidentialité absolue.
      </p>
      <p>
        Ne publiez pas de plans, devis, contrats ou documents confidentiels sans autorisation. Sifarah ne
        garantit pas le secret commercial d&apos;un contenu publié ou transmis via la Plateforme.
      </p>
    </section>

    <section>
      <h2>8. Publications, fil d&apos;actualités et modération</h2>
      <p>
        Les publications doivent être pertinentes et respecter les présentes Conditions. Sifarah peut
        examiner, demander des modifications, refuser, limiter, masquer ou retirer un contenu contraire aux
        Conditions, à la loi ou aux critères éditoriaux. L&apos;affichage d&apos;une publication ne signifie
        pas que Sifarah l&apos;approuve ou en garantit les affirmations.
      </p>
      <p>
        Les utilisateurs sont invités à signaler les contenus illicites, frauduleux ou attentatoires à leurs
        droits. Sifarah examine les signalements dans un délai raisonnable.
      </p>
    </section>

    <section>
      <h2>9. Contenu des Utilisateurs et licence</h2>
      <p>
        L&apos;Utilisateur conserve les droits qu&apos;il détient sur son Contenu. Il garantit disposer des
        droits nécessaires et accorde à Sifarah, pour la durée nécessaire à l&apos;exploitation du service,
        une licence non exclusive, mondiale et sans redevance permettant d&apos;héberger, stocker, reproduire
        techniquement, adapter au format, afficher et distribuer ce Contenu dans la mesure nécessaire pour
        fournir, sécuriser, améliorer et promouvoir la Plateforme.
      </p>
      <p>
        Cette licence n&apos;autorise pas Sifarah à vendre le Contenu comme produit autonome ni à rendre
        public un contenu configuré comme confidentiel. Elle prend fin pour l&apos;avenir lorsque le Contenu
        est retiré ou le compte supprimé, sous réserve des sauvegardes, des copies déjà partagées et des
        obligations légales.
      </p>
    </section>

    <section>
      <h2>10. Informations issues de sources publiques</h2>
      <p>
        Sifarah peut enrichir des profils et fiches à partir d&apos;informations professionnelles
        accessibles au public, dans le respect du droit applicable. Une entreprise ou personne concernée peut
        demander l&apos;accès, la correction, la mise à jour ou la dépublication via{" "}
        <Link to="/contact">Contact</Link>.
      </p>
    </section>

    <section>
      <h2>11. Propriété intellectuelle de Sifarah</h2>
      <p>
        Sous réserve des droits de tiers et du Contenu des Utilisateurs, la Plateforme et ses éléments propres
        (logiciel, interfaces, graphismes, marque, textes, organisation des bases de données) appartiennent à
        Sifarah ou sont utilisés avec autorisation.
      </p>
      <p>
        Sifarah accorde une autorisation limitée, personnelle, non exclusive et révocable d&apos;accéder à la
        Plateforme conformément à sa destination. Sauf autorisation écrite ou droit impératif, il est interdit
        de copier, republier, vendre, modifier, désassembler ou extraire systématiquement la base de données.
      </p>
    </section>

    <section>
      <h2>12. Offres payantes</h2>
      <p>
        Certaines fonctionnalités ou options de visibilité peuvent être payantes. Les prix, la durée et les
        modalités sont précisés avant la commande. Aucun paiement n&apos;est dû du seul fait de consulter une
        fonctionnalité gratuite. Les présentes Conditions ne constituent pas une promesse de visibilité, de
        contacts ou de résultats commerciaux, sauf engagement écrit exprès.
      </p>
    </section>

    <section>
      <h2>13. Mise en relation et absence de garantie sur les transactions</h2>
      <p>
        Sauf contrat distinct, Sifarah n&apos;est ni l&apos;employeur, ni le mandataire, ni le garant des
        Utilisateurs, et n&apos;est pas partie aux contrats qu&apos;ils concluent entre eux. Chaque
        Utilisateur doit effectuer ses propres vérifications avant de sélectionner un professionnel, commander
        un produit, confier des travaux ou conclure un contrat.
      </p>
    </section>

    <section>
      <h2>14. Recommandations et outils automatisés</h2>
      <p>
        Les résultats de recherche, classements ou recommandations sont fournis à titre indicatif. Ils peuvent
        être incomplets ou inexacts et ne remplacent pas l&apos;analyse d&apos;un professionnel qualifié.
      </p>
    </section>

    <section>
      <h2>15. Données personnelles et communications</h2>
      <p>
        Le traitement des données personnelles est décrit dans la{" "}
        <Link to="/confidentialite">Politique de confidentialité</Link>. Sifarah peut adresser les
        communications nécessaires au fonctionnement du service. Les communications promotionnelles sont
        envoyées conformément aux choix de l&apos;Utilisateur et à la loi applicable.
      </p>
    </section>

    <section>
      <h2>16. Disponibilité et évolution</h2>
      <p>
        Sifarah s&apos;efforce de maintenir une Plateforme accessible et sécurisée, sans garantir un
        fonctionnement continu ou exempt d&apos;erreurs. Des interruptions peuvent survenir pour maintenance,
        sécurité, mise à jour ou force majeure. Sifarah peut modifier, limiter ou retirer une fonctionnalité
        afin de faire évoluer le service ou de se conformer à la loi.
      </p>
    </section>

    <section>
      <h2>17. Suspension et fermeture de compte</h2>
      <p>
        L&apos;Utilisateur peut cesser d&apos;utiliser Sifarah à tout moment. Sifarah peut retirer un contenu,
        suspendre une fonctionnalité ou clôturer un compte en cas de violation des Conditions, d&apos;activité
        frauduleuse, d&apos;atteinte aux droits de tiers, de tentative de compromettre la Plateforme, ou
        d&apos;obligation légale. À la suite de la fermeture, les données sont traitées conformément à la
        Politique de confidentialité.
      </p>
    </section>

    <section>
      <h2>18. Signalement</h2>
      <p>
        Toute personne estimant qu&apos;un contenu porte atteinte à ses droits peut contacter Sifarah via{" "}
        <Link to="/contact">Contact</Link> en indiquant son identité, l&apos;emplacement du contenu, la nature
        du droit invoqué et les mesures demandées.
      </p>
    </section>

    <section>
      <h2>19. Responsabilité</h2>
      <p>
        Dans les limites autorisées par la loi, Sifarah ne répond pas des dommages indirects résultant de
        l&apos;utilisation de la Plateforme, ni des actes, contenus ou accords conclus entre Utilisateurs.
        L&apos;Utilisateur demeure responsable de son Contenu et de son comportement. Aucune disposition ne
        prive un consommateur des droits impératifs dont il bénéficie en vertu de la loi.
      </p>
    </section>

    <section>
      <h2>20. Services de tiers</h2>
      <p>
        Sifarah peut contenir des liens ou intégrations avec des services tiers (cartographie,
        authentification, paiement, partage, etc.). Ces services sont exploités par des tiers et peuvent être
        soumis à leurs propres conditions.
      </p>
    </section>

    <section>
      <h2>21. Modification des Conditions</h2>
      <p>
        Sifarah peut mettre à jour les présentes Conditions. La version en vigueur est publiée sur la
        Plateforme avec sa date de mise à jour. En cas de modification substantielle, Sifarah s&apos;efforcera
        d&apos;en informer les Utilisateurs. Si l&apos;Utilisateur n&apos;accepte pas les nouvelles
        Conditions, il doit cesser d&apos;utiliser les services concernés.
      </p>
    </section>

    <section>
      <h2>22. Droit applicable et litiges</h2>
      <p>
        Les présentes Conditions sont régies par le droit marocain, sous réserve des règles impératives
        applicables. En cas de difficulté, contactez d&apos;abord Sifarah via{" "}
        <Link to="/contact">Contact</Link> afin de rechercher une solution amiable. Tout litige relève des
        juridictions compétentes déterminées conformément au droit marocain.
      </p>
    </section>

    <section>
      <h2>23. Dispositions générales</h2>
      <p>
        Si une disposition est jugée invalide, les autres demeurent en vigueur. Le fait pour Sifarah de ne pas
        exercer immédiatement un droit ne constitue pas une renonciation. Les présentes Conditions,
        complétées le cas échéant par des conditions particulières et la Politique de confidentialité,
        constituent le cadre d&apos;utilisation de la Plateforme. Elles ne créent aucun partenariat, mandat ou
        relation d&apos;emploi du seul fait de l&apos;inscription.
      </p>
    </section>
  </LegalPageShell>
);

export default TermsOfUse;
