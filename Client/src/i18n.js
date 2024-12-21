// src/i18n.js

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// Uncomment the next line if you want to load translations from external JSON files
// import HttpApi from 'i18next-http-backend';

i18n
  // Uncomment the next line to load translations using HTTP (from external files)
  // .use(HttpApi)
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    // Debug mode (set to true during development)
    // debug: process.env.NODE_ENV === "development",

    // Fallback language in case the user language detection fails
    fallbackLng: "fr",

    // Supported languages
    supportedLngs: ["fr", "en"], // Add your supported languages here

    // Options for language detection
    detection: {
      // Order and from where user language should be detected
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],

      // Keys or params to lookup language from
      lookupQuerystring: "lng",
      lookupCookie: "i18next",
      lookupLocalStorage: "i18nextLng",

      // Cache user language on
      caches: ["localStorage", "cookie"],
    },

    // If using HttpApi to load translation files, set the path
    /*
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    */

    // Initialize with resources (translations can also be loaded via backend)
    resources: {
      en: {
        translation: {
          totalDonators: "Total Donators",
          // General
          welcome: "Welcome",
          dashboardWelcome: "Welcome to the Dashboard",
          home: "Home",
          dashboard: "Dashboard",
          profile: "Profile",
          logout: "Logout",
          login: "Login",
          register: "Register",
          search: "Search",
          filter: "Filter",
          sort: "Sort",
          actions: "Actions",
          save: "Save",
          cancel: "Cancel",
          edit: "Edit",
          delete: "Delete",
          view: "View",
          details: "Details",
          addNew: "Add New",
          update: "Update",
          submit: "Submit",
          reset: "Reset",
          yes: "Yes",
          no: "No",
          confirm: "Confirm",
          language: "Language",
          settings: "Settings",
          notifications: "Notifications",
          help: "Help",
          support: "Support",
          documentation: "Documentation",
          faq: "FAQ",
          termsOfService: "Terms of Service",
          privacyPolicy: "Privacy Policy",
          overview: "Overview",
          donators: "Donators",
          donations: "Donations",
          email: "Email",
          // Navigation
          navigationHome: "Home",
          navigationCustomers: "Customers",
          navigationLeads: "Leads",
          navigationOpportunities: "Opportunities",
          navigationContacts: "Contacts",
          navigationAccounts: "Accounts",
          navigationSales: "Sales",
          navigationMarketing: "Marketing",
          navigationReports: "Reports",
          navigationSettings: "Settings",
          navigationUserManagement: "User Management",

          // Customer Management
          customerTitle: "Customers",
          customerAdd: "Add Customer",
          customerEdit: "Edit Customer",
          customerDelete: "Delete Customer",
          customerDetails: "Customer Details",
          customerName: "Name",
          customerEmail: "Email",
          customerPhone: "Phone",
          customerAddress: "Address",
          customerCity: "City",
          customerState: "State",
          customerPostalCode: "Postal Code",
          customerCountry: "Country",
          customerCompany: "Company",
          customerIndustry: "Industry",
          customerWebsite: "Website",
          customerNotes: "Notes",
          customerTags: "Tags",
          customerAssignedTo: "Assigned To",
          customerStatus: "Status",

          // Leads Management
          leadTitle: "Leads",
          leadAdd: "Add Lead",
          leadEdit: "Edit Lead",
          leadDelete: "Delete Lead",
          leadDetails: "Lead Details",
          leadSource: "Source",
          leadCampaign: "Campaign",
          leadStatus: "Lead Status",
          leadQualification: "Qualification",

          // Opportunities Management
          opportunityTitle: "Opportunities",
          opportunityAdd: "Add Opportunity",
          opportunityEdit: "Edit Opportunity",
          opportunityDelete: "Delete Opportunity",
          opportunityDetails: "Opportunity Details",
          opportunityValue: "Value",
          opportunityProbability: "Probability",
          opportunityExpectedCloseDate: "Expected Close Date",
          opportunityStage: "Stage",

          // Contacts Management
          contactTitle: "Contacts",
          contactAdd: "Add Contact",
          contactEdit: "Edit Contact",
          contactDelete: "Delete Contact",
          contactDetails: "Contact Details",
          contactFirstName: "First Name",
          contactLastName: "Last Name",
          contactPosition: "Position",
          contactMobile: "Mobile",
          contactFax: "Fax",
          contactSkype: "Skype",

          // Accounts Management
          accountTitle: "Accounts",
          accountAdd: "Add Account",
          accountEdit: "Edit Account",
          accountDelete: "Delete Account",
          accountDetails: "Account Details",
          accountName: "Account Name",
          accountType: "Account Type",
          accountAnnualRevenue: "Annual Revenue",
          accountNumberOfEmployees: "Number of Employees",

          // Sales
          salesTitle: "Sales",
          salesPipeline: "Sales Pipeline",
          salesTargets: "Sales Targets",
          salesAchievements: "Sales Achievements",
          salesReports: "Sales Reports",

          // Marketing
          marketingTitle: "Marketing",
          marketingCampaigns: "Campaigns",
          marketingEmail: "Email Marketing",
          marketingSocialMedia: "Social Media",
          marketingContent: "Content",
          marketingAnalytics: "Marketing Analytics",

          // Reports
          reportTitle: "Reports",
          reportSales: "Sales Report",
          reportCustomer: "Customer Report",
          reportLead: "Lead Report",
          reportOpportunity: "Opportunity Report",
          reportExport: "Export Reports",

          // User Management
          userManagementTitle: "User Management",
          userManagementUsers: "Users",
          userManagementRoles: "Roles",
          userManagementPermissions: "Permissions",
          userManagementAddUser: "Add User",
          userManagementEditUser: "Edit User",
          userManagementDeleteUser: "Delete User",
          userManagementUserDetails: "User Details",
          userManagementRoleName: "Role Name",
          userManagementAssignRole: "Assign Role",

          // Settings
          settingsTitle: "Settings",
          settingsGeneral: "General",
          settingsProfile: "Profile Settings",
          settingsChangePassword: "Change Password",
          settingsNotifications: "Notification Settings",
          settingsIntegration: "Integration",
          settingsBilling: "Billing",
          settingsSubscription: "Subscription",
          settingsInvoice: "Invoice",
          settingsPayment: "Payment",

          // Notifications
          notificationNewMessage: "You have a new message",
          notificationUpdateSuccess: "Update successful",
          notificationDeleteSuccess: "Deletion successful",
          notificationErrorOccurred: "An error occurred",
          notificationLoading: "Loading...",
          notificationNoData: "No data available",

          // Forms
          formRequired: "This field is required",
          formInvalidEmail: "Invalid email address",
          formPasswordMismatch: "Passwords do not match",
          formMinLength: "Minimum length is {{count}} characters",
          formMaxLength: "Maximum length is {{count}} characters",

          // Buttons
          buttonSave: "Save",
          buttonCancel: "Cancel",
          buttonSubmit: "Submit",
          buttonDelete: "Delete",
          buttonEdit: "Edit",
          buttonView: "View",
          buttonDownload: "Download",
          buttonUpload: "Upload",
          buttonNext: "Next",
          buttonPrevious: "Previous",
          buttonFinish: "Finish",

          // Placeholders
          placeholderSearch: "Search...",
          placeholderEnterName: "Enter name",
          placeholderEnterEmail: "Enter email",
          placeholderEnterPhone: "Enter phone number",
          placeholderSelectStatus: "Select status",
          placeholderSelectRole: "Select role",
          placeholderEnterAddress: "Enter address",

          // Validation Messages
          validationRequired: "{{field}} is required",
          validationInvalid: "Invalid {{field}}",
          validationMin: "{{field}} should be at least {{count}}",
          validationMax: "{{field}} should be at most {{count}}",

          // Miscellaneous
          miscLoading: "Loading...",
          miscNoResults: "No results found",
          miscUnexpectedError: "An unexpected error occurred",
          miscPleaseWait: "Please wait...",
          miscSuccess: "Success",
          miscFailure: "Failure",
          miscToday: "Today",
          miscYesterday: "Yesterday",
          miscLastWeek: "Last Week",
          miscLastMonth: "Last Month",
          miscLastYear: "Last Year",

          // client info
          fName: "First Name",
          lName: "Last Name",
          email: "Email",
          phone: "Phone",
        },
      },
      fr: {
        translation: {
          totalDonators: "Total Donateurs",
          dashboardWelcome: "Bienvenue sur le tableau de bord",
          // General
          welcome: "Bienvenue",
          home: "Accueil",
          dashboard: "Tableau de bord",
          profile: "Profil",
          logout: "Déconnexion",
          login: "Connexion",
          register: "S'inscrire",
          search: "Recherche",
          filter: "Filtrer",
          sort: "Trier",
          actions: "Actions",
          save: "Enregistrer",
          cancel: "Annuler",
          edit: "Modifier",
          delete: "Supprimer",
          view: "Voir",
          details: "Détails",
          addNew: "Ajouter Nouveau",
          update: "Mettre à jour",
          submit: "Soumettre",
          reset: "Réinitialiser",
          yes: "Oui",
          no: "Non",
          confirm: "Confirmer",
          language: "Langue",
          settings: "Paramètres",
          notifications: "Notifications",
          help: "Aide",
          support: "Support",
          documentation: "Documentation",
          faq: "FAQ",
          termsOfService: "Conditions d'utilisation",
          privacyPolicy: "Politique de confidentialité",
          overview: "Aperçu",
          donators: "Donateurs",
          donations: "Dons",
          email: "Email",
          // Navigation
          navigationHome: "Accueil",
          navigationCustomers: "Clients",
          navigationLeads: "Pistes",
          navigationOpportunities: "Opportunités",
          navigationContacts: "Contacts",
          navigationAccounts: "Comptes",
          navigationSales: "Ventes",
          navigationMarketing: "Marketing",
          navigationReports: "Rapports",
          navigationSettings: "Paramètres",
          navigationUserManagement: "Gestion des utilisateurs",

          // Customer Management
          customerTitle: "Clients",
          customerAdd: "Ajouter un client",
          customerEdit: "Modifier le client",
          customerDelete: "Supprimer le client",
          customerDetails: "Détails du client",
          customerName: "Nom",
          customerEmail: "Email",
          customerPhone: "Téléphone",
          customerAddress: "Adresse",
          customerCity: "Ville",
          customerState: "État",
          customerPostalCode: "Code postal",
          customerCountry: "Pays",
          customerCompany: "Entreprise",
          customerIndustry: "Secteur d'activité",
          customerWebsite: "Site web",
          customerNotes: "Notes",
          customerTags: "Étiquettes",
          customerAssignedTo: "Attribué à",
          customerStatus: "Statut",

          // Leads Management
          leadTitle: "Pistes",
          leadAdd: "Ajouter une piste",
          leadEdit: "Modifier la piste",
          leadDelete: "Supprimer la piste",
          leadDetails: "Détails de la piste",
          leadSource: "Source",
          leadCampaign: "Campagne",
          leadStatus: "Statut de la piste",
          leadQualification: "Qualification",

          // Opportunities Management
          opportunityTitle: "Opportunités",
          opportunityAdd: "Ajouter une opportunité",
          opportunityEdit: "Modifier l'opportunité",
          opportunityDelete: "Supprimer l'opportunité",
          opportunityDetails: "Détails de l'opportunité",
          opportunityValue: "Valeur",
          opportunityProbability: "Probabilité",
          opportunityExpectedCloseDate: "Date de clôture prévue",
          opportunityStage: "Étape",

          // Contacts Management
          contactTitle: "Contacts",
          contactAdd: "Ajouter un contact",
          contactEdit: "Modifier le contact",
          contactDelete: "Supprimer le contact",
          contactDetails: "Détails du contact",
          contactFirstName: "Prénom",
          contactLastName: "Nom de famille",
          contactPosition: "Poste",
          contactMobile: "Mobile",
          contactFax: "Fax",
          contactSkype: "Skype",

          // Accounts Management
          accountTitle: "Comptes",
          accountAdd: "Ajouter un compte",
          accountEdit: "Modifier le compte",
          accountDelete: "Supprimer le compte",
          accountDetails: "Détails du compte",
          accountName: "Nom du compte",
          accountType: "Type de compte",
          accountAnnualRevenue: "Revenu annuel",
          accountNumberOfEmployees: "Nombre d'employés",

          // Sales
          salesTitle: "Ventes",
          salesPipeline: "Pipeline de ventes",
          salesTargets: "Objectifs de ventes",
          salesAchievements: "Réalisations de ventes",
          salesReports: "Rapports de ventes",

          // Marketing
          marketingTitle: "Marketing",
          marketingCampaigns: "Campagnes",
          marketingEmail: "Email Marketing",
          marketingSocialMedia: "Médias sociaux",
          marketingContent: "Contenu",
          marketingAnalytics: "Analytique marketing",

          // Reports
          reportTitle: "Rapports",
          reportSales: "Rapport de ventes",
          reportCustomer: "Rapport client",
          reportLead: "Rapport de pistes",
          reportOpportunity: "Rapport d'opportunités",
          reportExport: "Exporter les rapports",

          // User Management
          userManagementTitle: "Gestion des utilisateurs",
          userManagementUsers: "Utilisateurs",
          userManagementRoles: "Rôles",
          userManagementPermissions: "Autorisations",
          userManagementAddUser: "Ajouter un utilisateur",
          userManagementEditUser: "Modifier l'utilisateur",
          userManagementDeleteUser: "Supprimer l'utilisateur",
          userManagementUserDetails: "Détails de l'utilisateur",
          userManagementRoleName: "Nom du rôle",
          userManagementAssignRole: "Attribuer un rôle",

          // Settings
          settingsTitle: "Paramètres",
          settingsGeneral: "Général",
          settingsProfile: "Paramètres du profil",
          settingsChangePassword: "Changer le mot de passe",
          settingsNotifications: "Paramètres des notifications",
          settingsIntegration: "Intégration",
          settingsBilling: "Facturation",
          settingsSubscription: "Abonnement",
          settingsInvoice: "Facture",
          settingsPayment: "Paiement",

          // Notifications
          notificationNewMessage: "Vous avez un nouveau message",
          notificationUpdateSuccess: "Mise à jour réussie",
          notificationDeleteSuccess: "Suppression réussie",
          notificationErrorOccurred: "Une erreur est survenue",
          notificationLoading: "Chargement...",
          notificationNoData: "Aucune donnée disponible",

          // Forms
          formRequired: "Ce champ est requis",
          formInvalidEmail: "Adresse email invalide",
          formPasswordMismatch: "Les mots de passe ne correspondent pas",
          formMinLength: "La longueur minimale est de {{count}} caractères",
          formMaxLength: "La longueur maximale est de {{count}} caractères",

          // Buttons
          buttonSave: "Enregistrer",
          buttonCancel: "Annuler",
          buttonSubmit: "Soumettre",
          buttonDelete: "Supprimer",
          buttonEdit: "Modifier",
          buttonView: "Voir",
          buttonDownload: "Télécharger",
          buttonUpload: "Téléverser",
          buttonNext: "Suivant",
          buttonPrevious: "Précédent",
          buttonFinish: "Terminer",

          // Placeholders
          placeholderSearch: "Rechercher...",
          placeholderEnterName: "Entrez le nom",
          placeholderEnterEmail: "Entrez l'email",
          placeholderEnterPhone: "Entrez le numéro de téléphone",
          placeholderSelectStatus: "Sélectionnez le statut",
          placeholderSelectRole: "Sélectionnez le rôle",
          placeholderEnterAddress: "Entrez l'adresse",

          // Validation Messages
          validationRequired: "{{field}} est requis",
          validationInvalid: "{{field}} invalide",
          validationMin: "{{field}} doit être au moins {{count}}",
          validationMax: "{{field}} doit être au maximum {{count}}",

          // Miscellaneous
          miscLoading: "Chargement...",
          miscNoResults: "Aucun résultat trouvé",
          miscUnexpectedError: "Une erreur inattendue est survenue",
          miscPleaseWait: "Veuillez patienter...",
          miscSuccess: "Succès",
          miscFailure: "Échec",
          miscToday: "Aujourd'hui",
          miscYesterday: "Hier",
          miscLastWeek: "La semaine dernière",
          miscLastMonth: "Le mois dernier",
          miscLastYear: "L'année dernière",

          //   client info
          fName: "Prénom",
          lName: "Nom de famille",
          email: "Email",
          phone: "Téléphone",
        },
      },
    },

    // React settings
    react: {
      useSuspense: false, // Set to true if you are using Suspense
    },
  });

export default i18n;
