import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files - using dynamic imports for Vite compatibility
const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        about: "About",
        contact: "Contact", 
        agents: "Agents",
        login: "Sign In",
        register: "Sign Up",
        profile: "Profile",
        logout: "Logout",
        admin: "Admin Dashboard"
      },
      common: {
        search: "Search",
        filter: "Filter",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        close: "Close",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        reset: "Reset",
        confirmDelete: "Are you sure you want to delete this listing?",
        saveSuccess: "Saved/unsaved post!",
        deleteSuccess: "Listing deleted!",
        deleteError: "Failed to delete listing.",
        addToFavorites: "Add to favorites",
        addToCompare: "Add to compare",
        shareProperty: "Share property"
      },
      auth: {
        signIn: "Sign In",
        signUp: "Sign Up",
        username: "Username",
        password: "Password",
        email: "Email",
        welcomeBack: "Welcome Back",
        signInSubtitle: "Sign in to your account",
        forgotPassword: "Forgot Password?",
        noAccount: "Don't have an account?",
        loginSuccess: "Login successful",
        loginError: "Invalid credentials"
      },
      search: {
        searchProperties: "Search Properties",
        location: "Location",
        priceRange: "Price Range",
        propertyType: "Property Type",
        bedrooms: "Bedrooms",
        bathrooms: "Bathrooms",
        bedroom: "bedroom",
        bathroom: "bathroom",
        minPrice: "Min Price",
        maxPrice: "Max Price",
        anyLocation: "Any Location",
        anyType: "Any Type",
        results: "Search Results",
        noResults: "No properties found",
        resultsFor: "Search results for",
        allCities: "All Cities",
        cityLocation: "City Location",
        type: "Type",
        any: "Any",
        showAdvanced: "Show Advanced Filters",
        hideAdvanced: "Hide Advanced Filters",
        minSize: "Min Size (sq ft)",
        maxSize: "Max Size (sq ft)",
        utilitiesFilter: "Utilities",
        included: "Included",
        tenantPays: "Tenant Pays",
        shared: "Shared",
        petPolicyFilter: "Pet Policy",
        catsOnly: "Cats Only",
        dogsOnly: "Dogs Only",
        noPets: "No Pets",
        incomeRequirement: "Income Requirement",
        noRequirement: "No Requirement",
        nearSchool: "Near School",
        nearTransport: "Near Public Transport",
        nearRestaurants: "Near Restaurants",
        clearFilters: "Clear Filters"
      },
      property: {
        properties: "Properties",
        forSale: "For Sale",
        forRent: "For Rent",
        apartment: "Apartment",
        house: "House",
        condo: "Condo",
        villa: "Villa",
        land: "Land",
        commercial: "Commercial",
        new: "New",
        noDescription: "No description available",
        general: "General",
        utilities: "Utilities",
        utilitiesIncluded: "Utilities Included",
        ownerResponsible: "Owner is responsible",
        tenantResponsible: "Tenant is responsible",
        petPolicy: "Pet Policy",
        petsAllowed: "Pets Allowed",
        petsNotAllowed: "Pets Not Allowed",
        incomePolicy: "Income Policy",
        standardIncomeRequirements: "Standard income requirements apply",
        sizes: "Sizes",
        nearbyPlaces: "Nearby Places",
        school: "School",
        busStop: "Bus Stop",
        restaurant: "Restaurant",
        away: "away",
        location: "Location",
        priceAlerts: "Price Alerts",
        scheduleVisit: "Schedule Visit",
        similarProperties: "Similar Properties",
        sendMessage: "Send a Message",
        placeSaved: "Place Saved",
        savePlace: "Save the Place",
        favorited: "Favorited"
      },
      homepage: {
        title: "Find Real Estate & Get Your Dream Place",
        subtitle: "Discover modern apartments, stylish condos, and dream homes tailored for your comfort.",
        experience: "Years of Experience",
        awards: "Awards Gained",
        properties: "Properties Ready"
      }
    }
  },
  es: {
    translation: {
      nav: {
        home: "Inicio",
        about: "Acerca de",
        contact: "Contacto", 
        agents: "Agentes",
        login: "Iniciar Sesión",
        register: "Registrarse",
        profile: "Perfil",
        logout: "Cerrar Sesión",
        admin: "Panel de Administración"
      },
      common: {
        search: "Buscar",
        filter: "Filtro",
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        view: "Ver",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        close: "Cerrar",
        next: "Siguiente",
        previous: "Anterior",
        submit: "Enviar",
        reset: "Reiniciar",
        confirmDelete: "¿Estás seguro de que quieres eliminar esta lista?",
        saveSuccess: "¡Publicación guardada/eliminada!",
        deleteSuccess: "¡Lista eliminada!",
        deleteError: "Error al eliminar la lista.",
        addToFavorites: "Añadir a favoritos",
        addToCompare: "Añadir para comparar",
        shareProperty: "Compartir propiedad"
      },
      auth: {
        signIn: "Iniciar Sesión",
        signUp: "Registrarse",
        username: "Nombre de Usuario",
        password: "Contraseña",
        email: "Correo Electrónico",
        welcomeBack: "Bienvenido de Nuevo",
        signInSubtitle: "Inicia sesión en tu cuenta",
        forgotPassword: "¿Olvidaste tu contraseña?",
        noAccount: "¿No tienes una cuenta?",
        loginSuccess: "Inicio de sesión exitoso",
        loginError: "Credenciales inválidas"
      },
      search: {
        searchProperties: "Buscar Propiedades",
        location: "Ubicación",
        priceRange: "Rango de Precio",
        propertyType: "Tipo de Propiedad",
        bedrooms: "Dormitorios",
        bathrooms: "Baños",
        bedroom: "dormitorio",
        bathroom: "baño",
        minPrice: "Precio Mínimo",
        maxPrice: "Precio Máximo",
        anyLocation: "Cualquier Ubicación",
        anyType: "Cualquier Tipo",
        results: "Resultados de Búsqueda",
        noResults: "No se encontraron propiedades"
      },
      property: {
        properties: "Propiedades",
        forSale: "En Venta",
        forRent: "En Alquiler",
        apartment: "Apartamento",
        house: "Casa",
        condo: "Condominio",
        villa: "Villa",
        land: "Terreno",
        commercial: "Comercial",
        new: "Nuevo",
        noDescription: "No hay descripción disponible",
        general: "General",
        utilities: "Servicios",
        utilitiesIncluded: "Servicios Incluidos",
        ownerResponsible: "El propietario es responsable",
        tenantResponsible: "El inquilino es responsable",
        petPolicy: "Política de Mascotas",
        petsAllowed: "Mascotas Permitidas",
        petsNotAllowed: "Mascotas No Permitidas",
        incomePolicy: "Política de Ingresos",
        standardIncomeRequirements: "Se aplican requisitos de ingresos estándar",
        sizes: "Tamaños",
        nearbyPlaces: "Lugares Cercanos",
        school: "Escuela",
        busStop: "Parada de Autobús",
        restaurant: "Restaurante",
        away: "de distancia",
        location: "Ubicación",
        priceAlerts: "Alertas de Precio",
        scheduleVisit: "Programar Visita",
        similarProperties: "Propiedades Similares",
        sendMessage: "Enviar un Mensaje",
        placeSaved: "Lugar Guardado",
        savePlace: "Guardar el Lugar",
        favorited: "En Favoritos"
      },
      homepage: {
        title: "Encuentra Bienes Raíces y Obtén Tu Lugar Soñado",
        subtitle: "Descubre apartamentos modernos, condominios elegantes y casas de ensueño diseñadas para tu comodidad.",
        experience: "Años de Experiencia",
        awards: "Premios Obtenidos",
        properties: "Propiedades Listas"
      }
    }
  },
  fr: {
    translation: {
      nav: {
        home: "Accueil",
        about: "À propos",
        contact: "Contact", 
        agents: "Agents",
        login: "Se connecter",
        register: "S'inscrire",
        profile: "Profil",
        logout: "Déconnexion",
        admin: "Tableau de bord Admin"
      },
      common: {
        search: "Recherche",
        filter: "Filtre",
        save: "Sauvegarder",
        cancel: "Annuler",
        delete: "Supprimer",
        edit: "Modifier",
        view: "Voir",
        loading: "Chargement...",
        error: "Erreur",
        success: "Succès",
        close: "Fermer",
        next: "Suivant",
        previous: "Précédent",
        submit: "Soumettre",
        reset: "Réinitialiser",
        confirmDelete: "Êtes-vous sûr de vouloir supprimer cette annonce?",
        saveSuccess: "Publication sauvegardée/supprimée!",
        deleteSuccess: "Annonce supprimée!",
        deleteError: "Échec de la suppression de l'annonce.",
        addToFavorites: "Ajouter aux favoris",
        addToCompare: "Ajouter à la comparaison",
        shareProperty: "Partager la propriété"
      },
      search: {
        searchProperties: "Rechercher Propriétés",
        location: "Localisation",
        priceRange: "Gamme de Prix",
        propertyType: "Type de Propriété",
        bedrooms: "Chambres",
        bathrooms: "Salles de bain",
        bedroom: "chambre",
        bathroom: "salle de bain",
        minPrice: "Prix Min",
        maxPrice: "Prix Max",
        anyLocation: "Toute Localisation",
        anyType: "Tout Type",
        results: "Résultats de Recherche",
        noResults: "Aucune propriété trouvée"
      },
      property: {
        properties: "Propriétés",
        forSale: "À vendre",
        forRent: "À louer",
        apartment: "Appartement",
        house: "Maison",
        condo: "Copropriété",
        villa: "Villa",
        land: "Terrain",
        commercial: "Commercial",
        new: "Nouveau",
        noDescription: "Aucune description disponible",
        general: "Général",
        utilities: "Services",
        utilitiesIncluded: "Services Inclus",
        ownerResponsible: "Le propriétaire est responsable",
        tenantResponsible: "Le locataire est responsable",
        petPolicy: "Politique d'Animaux",
        petsAllowed: "Animaux Autorisés",
        petsNotAllowed: "Animaux Non Autorisés",
        incomePolicy: "Politique de Revenus",
        standardIncomeRequirements: "Les exigences de revenus standard s'appliquent",
        sizes: "Tailles",
        nearbyPlaces: "Lieux à Proximité",
        school: "École",
        busStop: "Arrêt de Bus",
        restaurant: "Restaurant",
        away: "de distance",
        location: "Emplacement",
        priceAlerts: "Alertes de Prix",
        scheduleVisit: "Programmer une Visite",
        similarProperties: "Propriétés Similaires",
        sendMessage: "Envoyer un Message",
        placeSaved: "Lieu Sauvegardé",
        savePlace: "Sauvegarder le Lieu",
        favorited: "En Favoris"
      },
      homepage: {
        title: "Trouvez l'Immobilier et Obtenez Votre Lieu de Rêve",
        subtitle: "Découvrez des appartements modernes, des condos élégants et des maisons de rêve adaptées à votre confort.",
        experience: "Années d'Expérience",
        awards: "Prix Remportés",
        properties: "Propriétés Prêtes"
      }
    }
  },
  ar: {
    translation: {
      nav: {
        home: "الرئيسية",
        about: "حول",
        contact: "اتصل بنا", 
        agents: "الوكلاء",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        profile: "الملف الشخصي",
        logout: "تسجيل الخروج",
        admin: "لوحة الإدارة"
      },
      common: {
        search: "بحث",
        filter: "فلتر",
        save: "حفظ",
        cancel: "إلغاء",
        delete: "حذف",
        edit: "تعديل",
        view: "عرض",
        loading: "جاري التحميل...",
        error: "خطأ",
        success: "نجح",
        close: "إغلاق",
        next: "التالي",
        previous: "السابق",
        submit: "إرسال",
        reset: "إعادة تعيين"
      },
      auth: {
        signIn: "تسجيل الدخول",
        signUp: "إنشاء حساب",
        username: "اسم المستخدم",
        password: "كلمة المرور",
        email: "البريد الإلكتروني",
        welcomeBack: "أهلاً بعودتك",
        signInSubtitle: "سجل دخولك إلى حسابك",
        forgotPassword: "نسيت كلمة المرور؟",
        noAccount: "ليس لديك حساب؟",
        loginSuccess: "تم تسجيل الدخول بنجاح",
        loginError: "بيانات اعتماد غير صحيحة"
      },
      search: {
        searchProperties: "البحث عن العقارات",
        location: "الموقع",
        priceRange: "نطاق السعر",
        propertyType: "نوع العقار",
        bedrooms: "غرف النوم",
        bathrooms: "الحمامات",
        minPrice: "أدنى سعر",
        maxPrice: "أعلى سعر",
        anyLocation: "أي موقع",
        anyType: "أي نوع",
        results: "نتائج البحث",
        noResults: "لم يتم العثور على عقارات"
      },
      property: {
        properties: "العقارات",
        forSale: "للبيع",
        forRent: "للإيجار",
        apartment: "شقة",
        house: "منزل",
        condo: "شقة فاخرة",
        villa: "فيلا",
        land: "أرض",
        commercial: "تجاري"
      },
      homepage: {
        title: "اعثر على العقارات واحصل على مكان أحلامك",
        subtitle: "اكتشف الشقق الحديثة والشقق الأنيقة ومنازل الأحلام المصممة خصيصاً لراحتك.",
        experience: "سنوات من الخبرة",
        awards: "الجوائز المحققة",
        properties: "العقارات الجاهزة"
      }
    }
  },
  de: {
    translation: {
      nav: {
        home: "Startseite",
        about: "Über uns",
        contact: "Kontakt", 
        agents: "Makler",
        login: "Anmelden",
        register: "Registrieren",
        profile: "Profil",
        logout: "Abmelden",
        admin: "Admin Dashboard"
      },
      common: {
        search: "Suchen",
        filter: "Filter",
        save: "Speichern",
        cancel: "Abbrechen",
        delete: "Löschen",
        edit: "Bearbeiten",
        view: "Anzeigen",
        loading: "Wird geladen...",
        error: "Fehler",
        success: "Erfolg",
        close: "Schließen",
        next: "Weiter",
        previous: "Zurück",
        submit: "Senden",
        reset: "Zurücksetzen",
        confirmDelete: "Sind Sie sicher, dass Sie diese Anzeige löschen möchten?",
        saveSuccess: "Beitrag gespeichert/entfernt!",
        deleteSuccess: "Anzeige gelöscht!",
        deleteError: "Fehler beim Löschen der Anzeige.",
        addToFavorites: "Zu Favoriten hinzufügen",
        addToCompare: "Zum Vergleich hinzufügen",
        shareProperty: "Immobilie teilen"
      },
      auth: {
        signIn: "Anmelden",
        signUp: "Registrieren",
        username: "Benutzername",
        password: "Passwort",
        email: "E-Mail",
        welcomeBack: "Willkommen zurück",
        signInSubtitle: "Melden Sie sich in Ihr Konto an",
        forgotPassword: "Passwort vergessen?",
        noAccount: "Haben Sie kein Konto?",
        loginSuccess: "Anmeldung erfolgreich",
        loginError: "Ungültige Anmeldedaten"
      },
      search: {
        searchProperties: "Immobilien suchen",
        location: "Standort",
        priceRange: "Preisspanne",
        propertyType: "Immobilientyp",
        bedrooms: "Schlafzimmer",
        bathrooms: "Badezimmer",
        bedroom: "Schlafzimmer",
        bathroom: "Badezimmer",
        minPrice: "Mindestpreis",
        maxPrice: "Höchstpreis",
        anyLocation: "Beliebiger Standort",
        anyType: "Beliebiger Typ",
        results: "Suchergebnisse",
        noResults: "Keine Immobilien gefunden"
      },
      property: {
        properties: "Immobilien",
        forSale: "Zu verkaufen",
        forRent: "Zu vermieten",
        apartment: "Wohnung",
        house: "Haus",
        condo: "Eigentumswohnung",
        villa: "Villa",
        land: "Grundstück",
        commercial: "Gewerbe",
        new: "Neu"
      },
      homepage: {
        title: "Finden Sie Immobilien und verwirklichen Sie Ihren Traumplatz",
        subtitle: "Entdecken Sie moderne Apartments, stilvolle Eigentumswohnungen und Traumhäuser für Ihren Komfort.",
        experience: "Jahre Erfahrung",
        awards: "Gewonnene Auszeichnungen",
        properties: "Verfügbare Immobilien"
      }
    }
  },
  he: {
    translation: {
      nav: {
        home: "בית",
        about: "אודות",
        contact: "צור קשר", 
        agents: "סוכנים",
        login: "התחברות",
        register: "הרשמה",
        profile: "פרופיל",
        logout: "התנתקות",
        admin: "לוח בקרה למנהל"
      },
      common: {
        search: "חיפוש",
        filter: "מסנן",
        save: "שמור",
        cancel: "ביטול",
        delete: "מחק",
        edit: "עריכה",
        view: "צפה",
        loading: "טוען...",
        error: "שגיאה",
        success: "הצלחה",
        close: "סגור",
        next: "הבא",
        previous: "קודם",
        submit: "שלח",
        reset: "איפוס",
        confirmDelete: "האם אתה בטוח שברצונך למחוק את הרישום הזה?",
        saveSuccess: "הפוסט נשמר/הוסר!",
        deleteSuccess: "הרישום נמחק!",
        deleteError: "נכשל במחיקת הרישום.",
        addToFavorites: "הוסף למועדפים",
        addToCompare: "הוסף להשוואה",
        shareProperty: "שתף נכס"
      },
      auth: {
        signIn: "התחברות",
        signUp: "הרשמה",
        username: "שם משתמש",
        password: "סיסמה",
        email: "אימייל",
        welcomeBack: "ברוך שובך",
        signInSubtitle: "התחבר לחשבון שלך",
        forgotPassword: "שכחת סיסמה?",
        noAccount: "אין לך חשבון?",
        loginSuccess: "התחברות הצליחה",
        loginError: "פרטי התחברות לא תקינים"
      },
      search: {
        searchProperties: "חפש נכסים",
        location: "מיקום",
        priceRange: "טווח מחירים",
        propertyType: "סוג נכס",
        bedrooms: "חדרי שינה",
        bathrooms: "חדרי רחצה",
        bedroom: "חדר שינה",
        bathroom: "חדר רחצה",
        minPrice: "מחיר מינימום",
        maxPrice: "מחיר מקסימום",
        anyLocation: "כל מיקום",
        anyType: "כל סוג",
        results: "תוצאות חיפוש",
        noResults: "לא נמצאו נכסים"
      },
      property: {
        properties: "נכסים",
        forSale: "למכירה",
        forRent: "להשכרה",
        apartment: "דירה",
        house: "בית",
        condo: "דירת גן",
        villa: "וילה",
        land: "קרקע",
        commercial: "מסחרי",
        new: "חדש"
      },
      homepage: {
        title: "מצא נדל״ן וקבל את מקום החלומות שלך",
        subtitle: "גלה דירות מודרניות, דירות נאות ובתי חלומות המותאמים לנוחותך.",
        experience: "שנות ניסיון",
        awards: "פרסים שזכה בהם",
        properties: "נכסים זמינים"
      }
    }
  },
  zh: {
    translation: {
      nav: {
        home: "首页",
        about: "关于我们",
        contact: "联系我们", 
        agents: "经纪人",
        login: "登录",
        register: "注册",
        profile: "个人资料",
        logout: "退出",
        admin: "管理面板"
      },
      common: {
        search: "搜索",
        filter: "筛选",
        save: "保存",
        cancel: "取消",
        delete: "删除",
        edit: "编辑",
        view: "查看",
        loading: "加载中...",
        error: "错误",
        success: "成功",
        close: "关闭",
        next: "下一页",
        previous: "上一页",
        submit: "提交",
        reset: "重置",
        confirmDelete: "您确定要删除这个房源吗？",
        saveSuccess: "房源已保存/取消保存！",
        deleteSuccess: "房源已删除！",
        deleteError: "删除房源失败。",
        addToFavorites: "添加到收藏",
        addToCompare: "添加到比较",
        shareProperty: "分享房产"
      },
      auth: {
        signIn: "登录",
        signUp: "注册",
        username: "用户名",
        password: "密码",
        email: "邮箱",
        welcomeBack: "欢迎回来",
        signInSubtitle: "登录到您的账户",
        forgotPassword: "忘记密码？",
        noAccount: "没有账户？",
        loginSuccess: "登录成功",
        loginError: "登录凭据无效"
      },
      search: {
        searchProperties: "搜索房产",
        location: "位置",
        priceRange: "价格范围",
        propertyType: "房产类型",
        bedrooms: "卧室",
        bathrooms: "浴室",
        bedroom: "卧室",
        bathroom: "浴室",
        minPrice: "最低价格",
        maxPrice: "最高价格",
        anyLocation: "任意位置",
        anyType: "任意类型",
        results: "搜索结果",
        noResults: "未找到房产"
      },
      property: {
        properties: "房产",
        forSale: "出售",
        forRent: "出租",
        apartment: "公寓",
        house: "房屋",
        condo: "共管公寓",
        villa: "别墅",
        land: "土地",
        commercial: "商业",
        new: "新"
      },
      homepage: {
        title: "寻找房地产，获得您的梦想之地",
        subtitle: "发现现代公寓、时尚共管公寓和为您的舒适而打造的梦想家园。",
        experience: "多年经验",
        awards: "获得奖项",
        properties: "可用房产"
      }
    }
  },
  ja: {
    translation: {
      nav: {
        home: "ホーム",
        about: "会社概要",
        contact: "お問い合わせ", 
        agents: "エージェント",
        login: "ログイン",
        register: "登録",
        profile: "プロフィール",
        logout: "ログアウト",
        admin: "管理画面"
      },
      common: {
        search: "検索",
        filter: "フィルター",
        save: "保存",
        cancel: "キャンセル",
        delete: "削除",
        edit: "編集",
        view: "表示",
        loading: "読み込み中...",
        error: "エラー",
        success: "成功",
        close: "閉じる",
        next: "次へ",
        previous: "前へ",
        submit: "送信",
        reset: "リセット",
        confirmDelete: "このリストを削除してもよろしいですか？",
        saveSuccess: "投稿が保存/削除されました！",
        deleteSuccess: "リストが削除されました！",
        deleteError: "リストの削除に失敗しました。",
        addToFavorites: "お気に入りに追加",
        addToCompare: "比較に追加",
        shareProperty: "物件を共有"
      },
      auth: {
        signIn: "ログイン",
        signUp: "登録",
        username: "ユーザー名",
        password: "パスワード",
        email: "メールアドレス",
        welcomeBack: "おかえりなさい",
        signInSubtitle: "アカウントにログイン",
        forgotPassword: "パスワードをお忘れですか？",
        noAccount: "アカウントをお持ちでないですか？",
        loginSuccess: "ログイン成功",
        loginError: "無効な資格情報"
      },
      search: {
        searchProperties: "物件検索",
        location: "場所",
        priceRange: "価格帯",
        propertyType: "物件タイプ",
        bedrooms: "寝室",
        bathrooms: "浴室",
        bedroom: "寝室",
        bathroom: "浴室",
        minPrice: "最低価格",
        maxPrice: "最高価格",
        anyLocation: "全ての場所",
        anyType: "全てのタイプ",
        results: "検索結果",
        noResults: "物件が見つかりません"
      },
      property: {
        properties: "物件",
        forSale: "売り物件",
        forRent: "賃貸物件",
        apartment: "アパート",
        house: "一戸建て",
        condo: "マンション",
        villa: "ヴィラ",
        land: "土地",
        commercial: "商業用",
        new: "新着"
      },
      homepage: {
        title: "不動産を見つけて、あなたの夢の場所を手に入れよう",
        subtitle: "あなたの快適さのために設計された現代的なアパート、スタイリッシュなマンション、夢の家を発見してください。",
        experience: "年の経験",
        awards: "受賞歴",
        properties: "利用可能な物件"
      }
    }
  }
};

// RTL languages
export const RTL_LANGUAGES = ['ar', 'he'];

// Language configurations
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية', rtl: true },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית', rtl: true },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' }
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false, // Disable debug in production
    
    // Force translations to update immediately
    load: 'languageOnly',
    preload: ['en', 'es', 'fr', 'de', 'ar', 'he', 'zh', 'ja'],
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged'
    }
  });

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  const isRTL = RTL_LANGUAGES.includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Add/remove RTL class for CSS styling
  if (isRTL) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
});

export default i18n;