// Nigeria location data: 36 states + FCT, each with its official LGAs and major cities.
// Used for cascading State → City / LGA address selectors.

export interface NigeriaStateInfo {
  lgas: string[];
  cities: string[];
}

export const NIGERIA_LOCATIONS: Record<string, NigeriaStateInfo> = {
  Abia: {
    cities: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu', 'Bende', 'Isuikwuato', 'Osisioma'],
    lgas: ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
  },
  Adamawa: {
    cities: ['Yola', 'Jimeta', 'Mubi', 'Numan', 'Ganye', 'Michika', 'Song'],
    lgas: ['Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  },
  'Akwa Ibom': {
    cities: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Abak', 'Ikot Abasi', 'Etinan'],
    lgas: ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
  },
  Anambra: {
    cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Ihiala', 'Aguleri', 'Ogidi'],
    lgas: ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  },
  Bauchi: {
    cities: ['Bauchi', 'Azare', 'Misau', "Jama'are", 'Katagum', 'Ningi', 'Tafawa Balewa'],
    lgas: ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', "Jama'are", 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  },
  Bayelsa: {
    cities: ['Yenagoa', 'Brass', 'Nembe', 'Ogbia', 'Sagbama', 'Ekeremor'],
    lgas: ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  },
  Benue: {
    cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Vandeikya', 'Adikpo'],
    lgas: ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  },
  Borno: {
    cities: ['Maiduguri', 'Biu', 'Bama', 'Dikwa', 'Gwoza', 'Monguno', 'Konduga'],
    lgas: ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
  },
  'Cross River': {
    cities: ['Calabar', 'Ogoja', 'Ikom', 'Obudu', 'Ugep', 'Obubra', 'Akamkpa'],
    lgas: ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala'],
  },
  Delta: {
    cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor', 'Effurun', 'Oleh', 'Ozoro'],
    lgas: ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
  },
  Ebonyi: {
    cities: ['Abakaliki', 'Afikpo', 'Onueke', 'Ezzamgbo', 'Ishieke'],
    lgas: ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  },
  Edo: {
    cities: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Igarra', 'Sabongida-Ora', 'Ubiaja'],
    lgas: ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  },
  Ekiti: {
    cities: ['Ado-Ekiti', 'Ikere-Ekiti', 'Ijero-Ekiti', 'Ikole-Ekiti', 'Efon-Alaaye', 'Ise-Ekiti'],
    lgas: ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
  },
  Enugu: {
    cities: ['Enugu', 'Nsukka', 'Oji River', 'Udi', 'Awgu', 'Agbani'],
    lgas: ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo-Uwani'],
  },
  FCT: {
    cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari', 'Kwali', 'Abaji'],
    lgas: ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'],
  },
  Gombe: {
    cities: ['Gombe', 'Kaltungo', 'Billiri', 'Dukku', 'Bajoga', 'Kumo'],
    lgas: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
  },
  Imo: {
    cities: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise', 'Oguta', 'Nkwerre'],
    lgas: ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'],
  },
  Jigawa: {
    cities: ['Dutse', 'Hadejia', 'Gumel', 'Kazaure', 'Birnin Kudu', 'Ringim'],
    lgas: ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  },
  Kaduna: {
    cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Zonkwa', 'Kagoro', 'Sabon Gari'],
    lgas: ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', "Jema'a", 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  },
  Kano: {
    cities: ['Kano', 'Wudil', 'Gaya', 'Rano', 'Bichi', 'Dambatta', 'Karaye'],
    lgas: ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  },
  Katsina: {
    cities: ['Katsina', 'Funtua', 'Daura', 'Malumfashi', 'Dutsin-Ma', 'Kankia'],
    lgas: ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin-Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', "Mai'Adua", 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  },
  Kebbi: {
    cities: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru', 'Jega', 'Bagudo'],
    lgas: ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
  },
  Kogi: {
    cities: ['Lokoja', 'Okene', 'Kabba', 'Idah', 'Ankpa', 'Dekina'],
    lgas: ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa-Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  },
  Kwara: {
    cities: ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba', 'Lafiagi', 'Patigi', 'Kaiama'],
    lgas: ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
  },
  Lagos: {
    cities: ['Ikeja', 'Lagos', 'Lekki', 'Ikorodu', 'Badagry', 'Epe', 'Surulere', 'Yaba', 'Victoria Island', 'Apapa'],
    lgas: ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  },
  Nasarawa: {
    cities: ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa', 'Karu', 'Doma', 'Wamba'],
    lgas: ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  },
  Niger: {
    cities: ['Minna', 'Bida', 'Suleja', 'Kontagora', 'Lapai', 'New Bussa', 'Mokwa'],
    lgas: ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Munya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  },
  Ogun: {
    cities: ['Abeokuta', 'Sagamu', 'Ijebu-Ode', 'Ota', 'Ilaro', 'Ifo', 'Ijebu-Igbo'],
    lgas: ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Sagamu', 'Yewa North', 'Yewa South'],
  },
  Ondo: {
    cities: ['Akure', 'Ondo', 'Owo', 'Ikare', 'Okitipupa', 'Idanre', 'Ore'],
    lgas: ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
  },
  Osun: {
    cities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede', 'Iwo', 'Ejigbo', 'Ikirun'],
    lgas: ['Aiyedaade', 'Aiyedire', 'Atakumosa East', 'Atakumosa West', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
  },
  Oyo: {
    cities: ['Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin', 'Saki', 'Igboho', 'Eruwa'],
    lgas: ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
  },
  Plateau: {
    cities: ['Jos', 'Bukuru', 'Pankshin', 'Shendam', 'Barkin Ladi', 'Vom', 'Langtang'],
    lgas: ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', "Qua'an Pan", 'Riyom', 'Shendam', 'Wase'],
  },
  Rivers: {
    cities: ['Port Harcourt', 'Bonny', 'Bori', 'Omoku', 'Ahoada', 'Okrika', 'Degema'],
    lgas: ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  },
  Sokoto: {
    cities: ['Sokoto', 'Tambuwal', 'Wurno', 'Illela', 'Gwadabawa', 'Bodinga'],
    lgas: ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  },
  Taraba: {
    cities: ['Jalingo', 'Wukari', 'Bali', 'Takum', 'Gembu', 'Ibi', 'Zing'],
    lgas: ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kurmi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  },
  Yobe: {
    cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru', 'Geidam', 'Buni Yadi'],
    lgas: ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
  },
  Zamfara: {
    cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Anka', 'Gummi', 'Maru'],
    lgas: ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zurmi'],
  },
};

export const NIGERIA_STATES: string[] = Object.keys(NIGERIA_LOCATIONS).sort((a, b) => a.localeCompare(b));

export function getCitiesForState(state: string): string[] {
  return NIGERIA_LOCATIONS[state]?.cities ?? [];
}

export function getLgasForState(state: string): string[] {
  return NIGERIA_LOCATIONS[state]?.lgas ?? [];
}
