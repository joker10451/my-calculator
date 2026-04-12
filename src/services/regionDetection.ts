export interface RegionData {
  name: string;
  mrot: number;
  mrotFed: number;
  hasRegionalMrot: boolean;
  itMortgageRate: number;
  familyMortgageRate: number;
  hasFamilyMortgage: boolean;
  benefits: string[];
}

const REGIONS: Record<string, RegionData> = {
  'Moscow': {
    name: 'Москва',
    mrot: 29389,
    mrotFed: 22440,
    hasRegionalMrot: true,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Региональный МРОТ выше федерального', 'Семейная ипотека до 12 млн ₽', 'IT-ипотека 5%'],
  },
  'Moscow Oblast': {
    name: 'Московская область',
    mrot: 29389,
    mrotFed: 22440,
    hasRegionalMrot: true,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Семейная ипотека до 12 млн ₽', 'IT-ипотека 5%', 'Льготная ипотека для молодых семей'],
  },
  'Saint Petersburg': {
    name: 'Санкт-Петербург',
    mrot: 29389,
    mrotFed: 22440,
    hasRegionalMrot: true,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Региональный МРОТ выше федерального', 'Семейная ипотека до 12 млн ₽', 'IT-ипотека 5%'],
  },
  'Leningrad Oblast': {
    name: 'Ленинградская область',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Семейная ипотека до 12 млн ₽', 'IT-ипотека 5%'],
  },
  'Tatarstan': {
    name: 'Республика Татарстан',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Семейная ипотека', 'IT-ипотека 5%', 'Социальная ипотека для многодетных'],
  },
  'Krasnodar Krai': {
    name: 'Краснодарский край',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Семейная ипотека', 'Льготная ипотека для молодых семей'],
  },
  'Sverdlovsk Oblast': {
    name: 'Свердловская область',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['IT-ипотека 5%', 'Семейная ипотека'],
  },
  'Novosibirsk Oblast': {
    name: 'Новосибирская область',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['IT-ипотека 5%', 'Семейная ипотека'],
  },
  'Kemerovo Oblast': {
    name: 'Кемеровская область',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Дальневосточная ипотека 2%', 'Семейная ипотека'],
  },
  'Primorsky Krai': {
    name: 'Приморский край',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 2.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Дальневосточная ипотека 2%', 'Семейная ипотека', 'IT-ипотека 5%'],
  },
  'Khabarovsk Krai': {
    name: 'Хабаровский край',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 2.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Дальневосточная ипотека 2%', 'Семейная ипотека'],
  },
  'Chechen Republic': {
    name: 'Чеченская Республика',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 1.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Северокавказская ипотека 1%', 'Семейная ипотека'],
  },
  'Dagestan': {
    name: 'Республика Дагестан',
    mrot: 22440,
    mrotFed: 22440,
    hasRegionalMrot: false,
    itMortgageRate: 1.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Северокавказская ипотека 1%', 'Семейная ипотека'],
  },
  'Yamalo-Nenets Autonomous Okrug': {
    name: 'ЯНАО',
    mrot: 29389,
    mrotFed: 22440,
    hasRegionalMrot: true,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Региональный МРОТ выше федерального', 'Арктическая ипотека 2%', 'IT-ипотека 5%'],
  },
  'Khanty-Mansi Autonomous Okrug': {
    name: 'ХМАО',
    mrot: 29389,
    mrotFed: 22440,
    hasRegionalMrot: true,
    itMortgageRate: 5.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Региональный МРОТ выше федерального', 'IT-ипотека 5%', 'Семейная ипотека'],
  },
  'Chukotka Autonomous Okrug': {
    name: 'Чукотский АО',
    mrot: 29389,
    mrotFed: 22440,
    hasRegionalMrot: true,
    itMortgageRate: 2.0,
    familyMortgageRate: 6.0,
    hasFamilyMortgage: true,
    benefits: ['Региональный МРОТ выше федерального', 'Арктическая ипотека 2%'],
  },
};

const DEFAULT_REGION: RegionData = {
  name: 'Ваш регион',
  mrot: 22440,
  mrotFed: 22440,
  hasRegionalMrot: false,
  itMortgageRate: 5.0,
  familyMortgageRate: 6.0,
  hasFamilyMortgage: true,
  benefits: ['IT-ипотека 5%', 'Семейная ипотека 6%'],
};

const CACHE_KEY = 'user_region';
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function detectRegion(): Promise<RegionData> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch {}

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('No geolocation'));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: CACHE_TTL,
      });
    });

    const { latitude, longitude } = position.coords;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ru`,
      { headers: { 'User-Agent': 'SchitayRU/1.0' } }
    );
    const data = await response.json();
    const regionName = data.address?.state || data.address?.region || '';

    const matched = Object.entries(REGIONS).find(([key, val]) =>
      regionName.includes(val.name.replace('Республика ', '').replace(' область', '').replace(' край', ''))
      || val.name.includes(regionName)
    );

    const result = matched ? matched[1] : { ...DEFAULT_REGION, name: regionName || DEFAULT_REGION.name };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: result }));
    } catch {}

    return result;
  } catch {
    return DEFAULT_REGION;
  }
}

export function getRegionByCity(city: string): RegionData {
  const matched = Object.values(REGIONS).find(r =>
    city.includes(r.name) || r.name.includes(city)
  );
  return matched ?? DEFAULT_REGION;
}
