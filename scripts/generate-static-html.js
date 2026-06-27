#!/usr/bin/env node

/**
 * Скрипт для генерации статических HTML файлов для GitHub Pages
 * Создает папки с index.html (URL со слэшем)
 */

import fs from 'fs';
import path from 'path';

// Конфигурация маршрутов
const routes = [
  { path: '/', folder: '.', title: 'Считай.RU — Бесплатные онлайн калькуляторы для России и СНГ', description: '🧮 Бесплатные калькуляторы 2026: ипотека, кредит, зарплата, ИМТ, ЖКХ, топливо. Точные расчёты за 10 секунд. Работает офлайн, без регистрации.' },
  { path: '/all/', folder: 'all', title: 'Все калькуляторы — Каталог онлайн калькуляторов', description: 'Полный каталог бесплатных онлайн калькуляторов: финансы, здоровье, транспорт, ЖКХ. Найдите нужный калькулятор.' },
  { path: '/about/', folder: 'about', title: 'О проекте Считай.RU — Бесплатные онлайн калькуляторы', description: 'Считай.RU — бесплатный сервис онлайн калькуляторов для России и СНГ. Ипотека, зарплата, налоги, ЖКХ и многое другое.' },
  { path: '/contacts/', folder: 'contacts', title: 'Контакты — Связаться с Считай.RU', description: 'Контактная информация Считай.RU. Email для связи, предложений и вопросов.' },
  { path: '/privacy/', folder: 'privacy', title: 'Политика конфиденциальности — Считай.RU', description: 'Политика обработки персональных данных сервиса Считай.RU. Как мы защищаем вашу информацию.' },
  { path: '/terms/', folder: 'terms', title: 'Условия использования — Считай.RU', description: 'Пользовательское соглашение сервиса Считай.RU. Правила использования бесплатных онлайн калькуляторов.' },
  { path: '/blog/', folder: 'blog', title: 'Блог — Полезные статьи о финансах и расчетах', description: 'Статьи о том, как правильно рассчитывать ипотеку, налоги, пособия. Советы по финансовому планированию от Считай.RU.' },
  { path: '/sitemap/', folder: 'sitemap', title: 'Карта сайта — Все калькуляторы | Считай.RU', description: 'Полный список всех калькуляторов и страниц сайта Считай.RU. Ипотека, кредит, зарплата, налоги, ЖКХ и другие.' },
  { path: '/offers/', folder: 'offers', title: 'Каталог офферов — банки, страхование, вакансии | Считай.RU', description: 'Каталог партнёрских офферов: ипотека, карты, вклады, ОСАГО/КАСКО и вакансии. Выберите предложение и перейдите на сайт партнёра.' },
  { path: '/jobs/', folder: 'jobs', title: 'Работа и подработка в Москве — курьер и мастер | Считай.RU', description: 'Подбор актуальной работы и подработки: курьерские вакансии и заказы для мастеров. Быстрый старт и понятные условия.' },
  { path: '/ruki-masters/', folder: 'ruki-masters', title: 'Сервис «Руки» — вакансии для мастеров в Москве | Считай.RU', description: 'Вакансии для мастеров по ремонту в Москве: стабильный поток заказов, гибкий формат работы и понятные условия.' },
  { path: '/tick-insurance/', folder: 'tick-insurance', title: 'Страхование от укуса клеща — онлайн оформление | Считай.RU', description: 'Подбор страхования от укуса клеща: оформление онлайн, понятные условия и защита в сезон активности клещей.' },
  { path: '/goldapple/', folder: 'goldapple', title: 'Золотое Яблоко — косметика и парфюмерия со скидками | Считай.RU', description: 'Золотое Яблоко: большой выбор косметики и парфюмерии, регулярные акции и доставка по России. Перейдите к актуальным предложениям.' },
  { path: '/gifts/', folder: 'gifts', title: 'Витрина подарков — подарочные сертификаты и наборы | Считай.RU', description: 'Выберите подарок: подарочные сертификаты, наборы и惊喜 от партнёров. Удобный подбор и оформление онлайн.' },
  { path: '/calculator/mortgage/', folder: 'calculator/mortgage', title: 'Ипотечный калькулятор онлайн — Расчет платежа 2026', description: 'Рассчитайте ипотеку онлайн: ежемесячный платеж, переплату, график платежей. Учитываем ставки 2026 года, первоначальный взнос, срок кредита.' },
  { path: '/calculator/salary/', folder: 'calculator/salary', title: 'Калькулятор зарплаты онлайн — Расчет НДФЛ и на руки', description: 'Рассчитайте зарплату с учетом НДФЛ 13%. Переводим зарплату до вычета налогов в зарплату на руки и наоборот. Актуальные ставки 2026.' },
  { path: '/calculator/credit/', folder: 'calculator/credit', title: 'Кредитный калькулятор онлайн — Расчет платежей', description: 'Калькулятор потребительского кредита: расчет ежемесячного платежа, процентов, переплаты. Аннуитетные и дифференцированные платежи.' },
  { path: '/calculator/bmi/', folder: 'calculator/bmi', title: 'Калькулятор ИМТ онлайн — Индекс массы тела', description: 'Рассчитайте индекс массы тела (ИМТ) бесплатно. Узнайте свою норму веса, ожирение или дефицит массы тела по формуле ВОЗ.' },
  { path: '/calculator/fuel/', folder: 'calculator/fuel', title: 'Калькулятор расхода топлива — Расчет стоимости поездки', description: 'Рассчитайте расход бензина на 100 км и стоимость поездки. Учитываем расход автомобиля, цену топлива, расстояние.' },
  { path: '/calculator/utilities/', folder: 'calculator/utilities', title: 'Калькулятор ЖКХ онлайн — Расчет коммунальных платежей', description: 'Рассчитайте коммунальные услуги: отопление, вода, электричество, газ. Тарифы ЖКХ 2026 по регионам России.' },
  { path: '/calculator/court-fee/', folder: 'calculator/court-fee', title: 'Калькулятор госпошлины в суд 2026 — Расчет онлайн', description: 'Рассчитайте госпошлину для суда общей юрисдикции и арбитражного суда. Тарифы 2026, льготы, калькулятор искового заявления.' },
  { path: '/calculator/deposit/', folder: 'calculator/deposit', title: 'Депозитный калькулятор онлайн — Расчет доходности вклада', description: 'Рассчитайте доходность банковского вклада с капитализацией и без. Проценты, сумма в конце срока, сравнение условий.' },
  { path: '/calculator/deposit-tax/', folder: 'calculator/deposit-tax', title: 'Калькулятор налога на вклады 2026 | Рассчитать НДФЛ онлайн', description: 'Рассчитайте сумму налога на вклады (НДФЛ 13%) за пару кликов. Актуальный расчет для 2025-2026 года с учетом вычета по максимальной ключевой ставке ЦБ.' },
  { path: '/calculator/currency/', folder: 'calculator/currency', title: 'Конвертер валют онлайн — Курс ЦБ РФ', description: 'Конвертер валют по курсу Центробанка России. Перевод рублей в доллары, евро, юани и обратно. Актуальный курс на сегодня.' },
  { path: '/calculator/refinancing/', folder: 'calculator/refinancing', title: 'Калькулятор рефинансирования — Выгодно ли перекредитоваться', description: 'Рассчитайте выгоду от рефинансирования кредита или ипотеки. Сравните старые и новые условия, экономию на процентах.' },
  { path: '/calculator/alimony/', folder: 'calculator/alimony', title: 'Калькулятор алиментов 2026 — Расчет размера выплат', description: 'Рассчитайте размер алиментов на ребенка в 2026 году. Процент от зарплаты, фиксированная сумма, МРОТ. Онлайн калькулятор.' },
  { path: '/calculator/alimony/dvoih-detey/', folder: 'calculator/alimony/dvoih-detey', title: 'Алименты на двоих детей 2026 — расчет онлайн, сколько процентов', description: 'Калькулятор алиментов на двоих детей 2026: рассчитайте сколько платить — 33% от зарплаты или твердая сумма. Формула по Семейному кодексу РФ.' },
  { path: '/calculator/court-fee/razvod/', folder: 'calculator/court-fee/razvod', title: 'Госпошлина за развод 2026 — сколько стоит расторжение брака', description: 'Калькулятор госпошлины за развод 2026: сколько стоит расторжение брака через ЗАГС и суд. Актуальные тарифы — 650 ₽ с каждого.' },
  { path: '/calculator/self-employed/npd/', folder: 'calculator/self-employed/npd', title: 'Налог самозанятых 2026 — калькулятор НПД, сколько платить', description: 'Калькулятор налога самозанятых 2026: рассчитайте НПД 4% или 6%, чистый доход после налога. Формула, лимит 2.4 млн.' },
  { path: '/calculator/mortgage/16-procentov/', folder: 'calculator/mortgage/16-procentov', title: 'Ипотека 16 процентов 2026 — калькулятор, переплата, досрочное', description: 'Калькулятор ипотеки под 16% в 2026 году: рассчитайте ежемесячный платеж, переплату и график. Сравните с семейной ипотекой 6%.' },
  { path: '/calculator/sick-leave/bolnichniy-list/', folder: 'calculator/sick-leave/bolnichniy-list', title: 'Больничный лист 2026 — калькулятор, расчёт пособия', description: 'Калькулятор больничного листа 2026: рассчитайте пособие по нетрудоспособности с учётом стажа и среднего заработка.' },
  { path: '/calculator/maternity-capital/', folder: 'calculator/maternity-capital', title: 'Калькулятор материнского капитала 2026', description: 'Рассчитайте размер материнского капитала в 2026 году. Индексация, региональные выплаты, на что потратить.' },
  { path: '/calculator/calories/', folder: 'calculator/calories', title: 'Калькулятор калорий онлайн — Суточная норма', description: 'Рассчитайте суточную норму калорий для похудения, набора массы или поддержания веса. Формулы Миффлина-Сан Жеора и Харриса-Бенедикта.' },
  { path: '/calculator/water/', folder: 'calculator/water', title: 'Калькулятор воды онлайн — Сколько пить воды в день', description: 'Рассчитайте дневную норму воды исходя из веса и активности. Сколько нужно пить воды в день для здоровья.' },
  { path: '/calculator/tire-size/', folder: 'calculator/tire-size', title: 'Калькулятор размера шин — Подбор шин для авто', description: 'Подберите шины для автомобиля по размеру. Калькулятор совместимости шин, сравнение размеров, расчет клиренса.' },
  { path: '/calculator/overpayment/', folder: 'calculator/overpayment', title: 'Калькулятор переплаты по ипотеке — узнайте реальную стоимость кредита', description: 'Рассчитайте реальную переплату по ипотеке. Узнайте сколько подарите банку за весь срок. Сравните ставки банков и найдите способ сэкономить до сотен тысяч рублей.' },
  { path: '/calculator/self-employed/', folder: 'calculator/self-employed', title: 'Калькулятор налогов для самозанятых и ИП 2026', description: 'Рассчитайте налоги для самозанятых, ИП на УСН и патенте. Сравните режимы налогообложения и узнайте чистый доход после уплаты налогов.' },
  { path: '/calculator/osago/', folder: 'calculator/osago', title: 'Калькулятор ОСАГО онлайн — Расчет стоимости полиса 2026', description: 'Рассчитайте стоимость ОСАГО онлайн. Учитываем класс водителя, регион, мощность двигателя, КБМ. Актуальные тарифы 2026.' },
  { path: '/calculator/kasko/', folder: 'calculator/kasko', title: 'Калькулятор КАСКО онлайн — Расчет стоимости полиса', description: 'Рассчитайте стоимость КАСКО для вашего автомобиля. Сравните предложения разных страховых компаний.' },
  { path: '/calculator/investment/', folder: 'calculator/investment', title: 'Калькулятор доходности инвестиций — Расчет прибыли', description: 'Рассчитайте доходность инвестиций с учетом сложного процента, инфляции и налогов. Планируйте финансовую независимость.' },
  { path: '/courier-yandex/', folder: 'courier-yandex', title: 'Курьер Яндекс.Еда / Яндекс.Лавка — доход до 8 500 ₽/день', description: 'Станьте курьером Яндекс.Еда или Яндекс.Лавка. Доход до 8 500 ₽ в день, свободное расписание, ежедневные выплаты.' },
  { path: '/joy-money/', folder: 'joy-money', title: 'JoyMoney — займ за 5 минут, первый займ 0% до 30 000 ₽', description: 'Получите займ в JoyMoney за 5 минут. Первый займ под 0% до 30 000 ₽. Без справок, поручителей и визитов в офис.' },
  { path: '/widgets/', folder: 'widgets', title: 'Виджеты калькуляторов для встраивания на сайт', description: 'Встройте наши калькуляторы на свой сайт. Бесплатные виджеты для ипотеки, кредитов, вкладов и других расчётов.' },
  { path: '/quiz/financial-literacy/', folder: 'quiz/financial-literacy', title: 'Тест на финансовую грамотность — проверьте свои знания', description: 'Пройдите бесплатный тест на финансовую грамотность. 10 вопросов по кредитам, инвестициям, налогам и сбережениям.' },
  
  // Категории калькуляторов
  { path: '/category/finance/', folder: 'category/finance', title: 'Финансовые калькуляторы онлайн — расчет ипотеки, кредитов, вкладов', description: 'Полный набор финансовых калькуляторов: ипотека, потребительские кредиты, расчет НДФЛ, вклады и рефинансирование.' },
  { path: '/category/salary/', folder: 'category/salary', title: 'Зарплата и налоги — НДФЛ, отпускные, больничный', description: 'Калькуляторы для расчета зарплаты, НДФЛ, отпускных, больничных и налогов по актуальным правилам.' },
  { path: '/category/auto/', folder: 'category/auto', title: 'Авто калькуляторы онлайн — ОСАГО, топливо, КАСКО', description: 'Все калькуляторы для автовладельцев: расчет ОСАГО, КАСКО, расход топлива и стоимость поездки.' },
  { path: '/category/housing/', folder: 'category/housing', title: 'Калькуляторы ЖКХ — расчет коммунальных услуг онлайн', description: 'Удобные калькуляторы для расчета коммунальных платежей: электроэнергия, вода, газ, отопление. Тарифы и льготы.' },
  { path: '/category/health/', folder: 'category/health', title: 'Здоровье и фитнес — ИМТ, калории, вода', description: 'Калькуляторы для здоровья: индекс массы тела, суточная норма калорий и воды.' },
  { path: '/category/legal/', folder: 'category/legal', title: 'Юридические калькуляторы — госпошлина, алименты, сроки', description: 'Расчет госпошлины в суды, алиментов на детей, сроков исковой давности и других юридических параметров.' },
  { path: '/category/family/', folder: 'category/family', title: 'Семейные калькуляторы — пособия, маткапитал, дети', description: 'Калькуляторы для всей семьи: материнский капитал, детские пособия, алименты, декретные и отпускные.' },

  // Категории блога
  { path: '/blog/category/mortgage-credit/', folder: 'blog/category/mortgage-credit', title: 'Ипотека и кредиты — полезные статьи | Считай.RU', description: 'Читайте экспертные статьи об ипотеке, кредитах и рефинансировании. Как выбрать банк и снизить переплату.' },
  { path: '/blog/category/taxes-salary/', folder: 'blog/category/taxes-salary', title: 'Налоги и зарплата — советы экспертов | Считай.RU', description: 'Все о налогах в России: НДФЛ, налоговые вычеты, расчет зарплаты и изменения в законодательстве 2026.' },
  { path: '/blog/category/utilities-housing/', folder: 'blog/category/utilities-housing', title: 'ЖКХ и недвижимость — как платить меньше | Считай.RU', description: 'Актуальные советы по экономии на услугах ЖКХ, правила перерасчета и новые тарифы 2026 года.' },
  { path: '/blog/category/auto-transport/', folder: 'blog/category/auto-transport', title: 'Авто и транспорт — советы для водителей | Считай.RU', description: 'Статьи об ОСАГО, КАСКО, автокредитах и экономии на топливе. Все для автовладельцев.' },
  { path: '/blog/category/health-fitness/', folder: 'blog/category/health-fitness', title: 'Здоровье и фитнес — калькуляторы и статьи | Считай.RU', description: 'Как поддерживать форму, рассчитывать калории и ИМТ. Советы по здоровому образу жизни и питанию.' },
  { path: '/blog/category/investments-deposits/', folder: 'blog/category/investments-deposits', title: 'Инвестиции и вклады — куда вложить деньги | Считай.RU', description: 'Обзоры банковских вкладов, стратегии инвестирования и пассивного дохода в 2026 году.' },
  { path: '/blog/category/legal-issues/', folder: 'blog/category/legal-issues', title: 'Юридические вопросы — права и обязанности | Считай.RU', description: 'Просто о сложных юридических вопросах: суды, госпошлины, права потребителей и семейное право.' },
  { path: '/blog/category/family-children/', folder: 'blog/category/family-children', title: 'Семья и дети — пособия и выплаты | Считай.RU', description: 'Все о материнском капитале, детских пособиях и поддержке семей в 2026 году.' },
  // Blog posts
  { path: '/blog/ipoteka-2026-novye-usloviya/', folder: 'blog/ipoteka-2026-novye-usloviya', title: 'Ипотека 2026: новые условия и ставки | Считай.RU', description: 'Обзор изменений в ипотечном кредитовании 2026 года. Новые ставки, условия, льготные программы.' },
  { path: '/blog/ndfl-2026-progressivnaya-shkala/', folder: 'blog/ndfl-2026-progressivnaya-shkala', title: 'НДФЛ 2026: прогрессивная шкала | Считай.RU', description: 'Как изменился НДФЛ в 2026 году. Прогрессивная шкала налогообложения, новые ставки, примеры расчёта.' },
  { path: '/blog/tarify-zhkh-2026-kak-ekonomit/', folder: 'blog/tarify-zhkh-2026-kak-ekonomit', title: 'Тарифы ЖКХ 2026: как экономить | Считай.RU', description: 'Актуальные тарифы ЖКХ 2026 года. Советы по экономии на коммунальных платежах.' },
  { path: '/blog/alimenty-2026-razmery-poryadok-vzyskaniya/', folder: 'blog/alimenty-2026-razmery-poryadok-vzyskaniya', title: 'Алименты 2026: размеры и порядок взыскания | Считай.RU', description: 'Размеры алиментов в 2026 году. Порядок взыскания, изменения в законодательстве.' },
  { path: '/blog/osago-2026-stoimost-kak-oformit/', folder: 'blog/osago-2026-stoimost-kak-oformit', title: 'ОСАГО 2026: стоимость и оформление | Считай.RU', description: 'Как оформить ОСАГО в 2026 году. Стоимость полиса, изменения в тарифах.' },
  { path: '/blog/kasko-2026-chto-pokryvaet-stoit-li-oformlyat/', folder: 'blog/kasko-2026-chto-pokryvaet-stoit-li-oformlyat', title: 'КАСКО 2026: что покрывает и стоит ли оформлять | Считай.RU', description: 'Обзор КАСКО 2026. Что покрывает полис, стоимость, стоит ли оформлять.' },
  { path: '/blog/otpusknye-2026-raschet-sroki-vyplaty/', folder: 'blog/otpusknye-2026-raschet-sroki-vyplaty', title: 'Отпускные 2026: расчёт, сроки, выплаты | Считай.RU', description: 'Как рассчитать отпускные в 2026 году. Сроки выплат, формулы, примеры расчёта.' },
  { path: '/blog/bolnichnyj-2026-raschet-oformlenie/', folder: 'blog/bolnichnyj-2026-raschet-oformlenie', title: 'Больничный 2026: расчёт и оформление | Считай.RU', description: 'Как рассчитать больничный в 2026 году. Порядок оформления, сроки выплат.' },
  { path: '/blog/imt-2026-norma-kak-rasschitat/', folder: 'blog/imt-2026-norma-kak-rasschitat', title: 'ИМТ 2026: норма и как рассчитать | Считай.RU', description: 'Индекс массы тела 2026. Нормы ВОЗ, формула расчёта, интерпретация результатов.' },
  { path: '/blog/vklady-2026-luchshie-predlozheniya/', folder: 'blog/vklady-2026-luchshie-predlozheniya', title: 'Банковские вклады 2026: лучшие предложения | Считай.RU', description: 'Лучшие банковские вклады 2026 года. Сравнение ставок, условий, надёжность банков.' },
  { path: '/blog/investicii-2026-kuda-vlozhit-dengi/', folder: 'blog/investicii-2026-kuda-vlozhit-dengi', title: 'Инвестиции 2026: куда вложить деньги | Считай.RU', description: 'Куда инвестировать в 2026 году. Обзор инструментов, стратегии, риски.' },
  { path: '/blog/gosposhliny-2026-razmery-kak-rasschitat/', folder: 'blog/gosposhliny-2026-razmery-kak-rasschitat', title: 'Госпошлины 2026: размеры и расчёт | Считай.RU', description: 'Размеры госпошлин 2026 года. Как рассчитать, льготы, порядок оплаты.' },
  { path: '/blog/kreditnye-karty-2026-luchshie-predlozheniya/', folder: 'blog/kreditnye-karty-2026-luchshie-predlozheniya', title: 'Кредитные карты 2026: лучшие предложения | Считай.RU', description: 'Лучшие кредитные карты 2026 года. Сравнение условий, льготных периодов, кэшбэка.' },
  { path: '/blog/materinskij-kapital-2026-razmer-kak-poluchit/', folder: 'blog/materinskij-kapital-2026-razmer-kak-poluchit', title: 'Материнский капитал 2026: размер и как получить | Считай.RU', description: 'Материнский капитал 2026. Размер выплат, порядок получения, на что потратить.' },
  { path: '/blog/refinansirovanie-kreditov-2026-kak-snizit-stavku/', folder: 'blog/refinansirovanie-kreditov-2026-kak-snizit-stavku', title: 'Рефинансирование кредитов 2026: как снизить ставку | Считай.RU', description: 'Рефинансирование кредитов в 2026 году. Как снизить ставку, условия банков, выгода.' },
  { path: '/blog/raschet-kalorij-2026-norma-dlya-pokhudeniya/', folder: 'blog/raschet-kalorij-2026-norma-dlya-pokhudeniya', title: 'Расчёт калорий 2026: норма для похудения | Считай.RU', description: 'Как рассчитать суточную норму калорий в 2026 году. Формулы, примеры, советы.' },
  // SEO articles
  { path: '/blog/kalkulyator-ndfl-raschet-nalogov-s-zarplaty-2026/', folder: 'blog/kalkulyator-ndfl-raschet-nalogov-s-zarplaty-2026', title: 'Калькулятор НДФЛ 2026: как рассчитать налог с зарплаты онлайн | Считай.RU', description: 'Подробный гайд по расчёту НДФЛ в 2026 году. Прогрессивная шкала, налоговые вычеты, примеры расчёта. Бесплатный онлайн-калькулятор.' },
  { path: '/blog/refinansirovanie-ipoteki-2026-kalkulyator-vygoda/', folder: 'blog/refinansirovanie-ipoteki-2026-kalkulyator-vygoda', title: 'Рефинансирование ипотеки 2026: калькулятор выгоды | Считай.RU', description: 'Полный гайд по рефинансированию ипотеки в 2026 году. Калькулятор выгоды, условия банков, подводные камни.' },
  { path: '/blog/materinskij-kapital-2026-razmer-kak-poluchit-na-chto-potratit/', folder: 'blog/materinskij-kapital-2026-razmer-kak-poluchit-na-chto-potratit', title: 'Материнский капитал 2026: размер, как получить, на что потратить | Считай.RU', description: 'Полный гайд по материнскому капиталу 2026. Размер выплат, индексация, условия получения, направления использования.' },
  // New SEO articles
  { path: '/blog/dosrochnoe-pogashenie-kredita-2026-chto-vygodnee/', folder: 'blog/dosrochnoe-pogashenie-kredita-2026-chto-vygodnee', title: 'Досрочное погашение кредита 2026: срок или платёж — что выгоднее | Считай.RU', description: 'Подробный разбор двух стратегий досрочного погашения. Калькулятор, примеры расчёта, реальные цифры.' },
  { path: '/blog/kalkulyator-inflyacii-2026-skolko-budut-stoit-dengi/', folder: 'blog/kalkulyator-inflyacii-2026-skolko-budut-stoit-dengi', title: 'Калькулятор инфляции 2026: сколько будут стоить деньги | Считай.RU', description: 'Узнайте, как инфляция съедает ваши сбережения. Калькулятор покупательной способности, примеры, стратегии.' },
  { path: '/blog/luchshie-kreditnye-karty-2026-sravnenie-usloviya/', folder: 'blog/luchshie-kreditnye-karty-2026-sravnenie-usloviya', title: 'Лучшие кредитные карты 2026: сравнение условий | Считай.RU', description: 'Рейтинг лучших кредитных карт 2026 года. Сравнение льготных периодов, ставок, кэшбэка.' },
  { path: '/blog/kalkulyator-pensii-2026-kogda-vyjdu-na-pensiyu/', folder: 'blog/kalkulyator-pensii-2026-kogda-vyjdu-na-pensiyu', title: 'Калькулятор пенсии 2026: когда выйдете на пенсию | Считай.RU', description: 'Рассчитайте свою будущую пенсию. Формула расчёта, пенсионные баллы, стаж.' },
  { path: '/blog/osago-2026-kalkulyator-kak-rasschitat-stoimost/', folder: 'blog/osago-2026-kalkulyator-kak-rasschitat-stoimost', title: 'ОСАГО 2026: калькулятор стоимости, коэффициенты | Считай.RU', description: 'Рассчитайте стоимость ОСАГО онлайн. Все коэффициенты 2026 года, скидки за безаварийность.' },
  { path: '/blog/kuda-vlozhit-dengi-2026-top-strategii/', folder: 'blog/kuda-vlozhit-dengi-2026-top-strategii', title: 'Куда вложить деньги в 2026 году: 7 стратегий | Считай.RU', description: 'Подробный обзор инвестиционных инструментов 2026. Вклады, облигации, акции, недвижимость.' },
  { path: '/blog/otpusknye-2026-kalkulyator-kogda-vygodnee-idti/', folder: 'blog/otpusknye-2026-kalkulyator-kogda-vygodnee-idti', title: 'Отпускные 2026: калькулятор и когда выгоднее идти в отпуск | Считай.RU', description: 'Как рассчитать отпускные в 2026 году. Формула, примеры, в каком месяце выгоднее отдыхать.' },
  { path: '/blog/rabota-v-moskve-bez-opyta-2026-gde-bystro-startovat/', folder: 'blog/rabota-v-moskve-bez-opyta-2026-gde-bystro-startovat', title: 'Работа в Москве без опыта в 2026: где быстро стартовать | Считай.RU', description: 'Где искать работу в Москве без опыта в 2026 году: курьерские вакансии и заказы для мастеров. Пошаговый чек-лист и полезные ссылки.' },
  { path: '/blog/podrabotka-na-vyhodnye-v-moskve-2026-gde-iskat/', folder: 'blog/podrabotka-na-vyhodnye-v-moskve-2026-gde-iskat', title: 'Подработка на выходные в Москве в 2026: где искать | Считай.RU', description: 'Где искать подработку на выходные в Москве в 2026 году: курьерские смены и заказы для мастеров. Чек-лист и полезные ссылки.' },
  { path: '/blog/skolko-mozhno-zarabotat-kurerom-v-moskve-2026/', folder: 'blog/skolko-mozhno-zarabotat-kurerom-v-moskve-2026', title: 'Сколько можно заработать курьером в Москве в 2026 | Считай.RU', description: 'Как посчитать доход курьера в Москве в 2026 году: смены, расходы, чистый результат и практический чек-лист.' },
  { path: '/blog/rabota-masterom-po-sborke-kuhon-v-moskve-2026/', folder: 'blog/rabota-masterom-po-sborke-kuhon-v-moskve-2026', title: 'Работа мастером по сборке кухонь в Москве в 2026 | Считай.RU', description: 'Требования и формат работы мастером по сборке кухонь в Москве в 2026 году. Как оценить график, загрузку и реальный доход.' },
  { path: '/calculator/tax-deduction/', folder: 'calculator/tax-deduction', title: 'Калькулятор налогового вычета 2026 — сколько вернёт государство | Считай.RU', description: 'Рассчитайте налоговый вычет 13% за покупку жилья, лечение, обучение. Имущественный, социальный, стандартный вычеты.' },
  { path: '/calculator/compound-interest/', folder: 'calculator/compound-interest', title: 'Калькулятор сложного процента 2026 — расчёт доходности | Считай.RU', description: 'Рассчитайте доходность инвестиций со сложным процентом. Узнайте сколько накопите за 5, 10, 20 лет.' },
  { path: '/calculator/rent-vs-buy/', folder: 'calculator/rent-vs-buy', title: 'Аренда или покупка квартиры 2026 — что выгоднее? | Считай.RU', description: 'Сравните расходы на аренду и покупку квартиры в ипотеку. Учитываем рост цен, ставки, инвестиции.' },
  { path: '/calculator/budget/', folder: 'calculator/budget', title: 'Калькулятор бюджета 50/30/20 — распределение доходов | Считай.RU', description: 'Распределите доход по правилу 50/30/20: необходимое, желания, сбережения. Узнайте сколько откладывать.' },
  { path: '/calculator/calories/', folder: 'calculator/calories', title: 'Калькулятор калорий онлайн — суточная норма | Считай.RU', description: 'Рассчитайте суточную норму калорий для похудения, набора массы или поддержания веса.' },
  { path: '/my-finances/', folder: 'my-finances', title: 'Мои финансы — персональный дашборд | Считай.RU', description: 'Отслеживайте свои кредиты, цели накоплений и ежемесячные платежи. Без регистрации.' },
  { path: '/banks/', folder: 'banks', title: 'Рейтинг банков 2026 — ставки по ипотеке, кредитам и вкладам | Считай.RU', description: 'Сравните ставки крупнейших банков России: ипотека, кредиты, вклады. Сортируемые таблицы.' },
  { path: '/insurance/osgop-taxi/', folder: 'insurance/osgop-taxi', title: 'ОСГОП для такси онлайн — обязательная страховка от 3 392 ₽ | Зетта Страхование', description: 'Оформите ОСГОП для такси за 3 минуты. Штрафы до 1 млн ₽ без полиса. Выплаты до 2 млн ₽ пассажирам.' },
  // Google verification
  { path: '/google110b9cc8d3bca8f9.html', folder: '.', title: '', description: '', isGoogleVerification: true },
  // SEO Landing Pages (автогенерация)
  { path: '/calc/ipoteka-3-mln-na-15-let/', folder: 'calc/ipoteka-3-mln-na-15-let', title: 'Ипотека 3 млн на 15 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 3 000 000 ₽ на 15 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/ipoteka-5-mln-na-20-let/', folder: 'calc/ipoteka-5-mln-na-20-let', title: 'Ипотека 5 млн на 20 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 5 000 000 ₽ на 20 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/ipoteka-6-mln-na-20-let/', folder: 'calc/ipoteka-6-mln-na-20-let', title: 'Ипотека 6 млн на 20 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 6 000 000 ₽ на 20 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/ipoteka-10-mln-na-25-let/', folder: 'calc/ipoteka-10-mln-na-25-let', title: 'Ипотека 10 млн на 25 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 10 000 000 ₽ на 25 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/ipoteka-15-mln-na-30-let/', folder: 'calc/ipoteka-15-mln-na-30-let', title: 'Ипотека 15 млн на 30 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 15 000 000 ₽ на 30 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/ipoteka-sberbank-2026/', folder: 'calc/ipoteka-sberbank-2026', title: 'Ипотека Сбербанк 2026 — ставка 14.9%, расчёт платежа | Считай.RU', description: 'Рассчитайте ипотеку в Сбербанке по ставке 14.9%. Ежемесячный платёж, переплата, условия 2026 года.' },
  { path: '/calc/ipoteka-vtb-2026/', folder: 'calc/ipoteka-vtb-2026', title: 'Ипотека ВТБ 2026 — ставка 14.5%, расчёт платежа | Считай.RU', description: 'Рассчитайте ипотеку в ВТБ по ставке 14.5%. Ежемесячный платёж, переплата, условия 2026 года.' },
  { path: '/calc/ipoteka-alfa-bank-2026/', folder: 'calc/ipoteka-alfa-bank-2026', title: 'Ипотека Альфа-Банк 2026 — ставка 15.2%, расчёт | Считай.RU', description: 'Рассчитайте ипотеку в Альфа-Банке по ставке 15.2%. Ежемесячный платёж, переплата, условия 2026.' },
  { path: '/calc/ipoteka-tbank-2026/', folder: 'calc/ipoteka-tbank-2026', title: 'Ипотека Т-Банк 2026 — ставка 15.5%, расчёт | Считай.RU', description: 'Рассчитайте ипотеку в Т-Банке по ставке 15.5%. Ежемесячный платёж, переплата, условия 2026.' },
  { path: '/calc/kredit-500-tysyach-na-3-goda/', folder: 'calc/kredit-500-tysyach-na-3-goda', title: 'Кредит 500 000 ₽ на 3 года — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте кредит 500 000 ₽ на 3 года. Ежемесячный платёж, переплата. Актуальные ставки 2026.' },
  { path: '/calc/kredit-1-mln-na-5-let/', folder: 'calc/kredit-1-mln-na-5-let', title: 'Кредит 1 000 000 ₽ на 5 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте кредит 1 000 000 ₽ на 5 лет. Ежемесячный платёж, переплата. Актуальные ставки 2026.' },
  { path: '/calc/kredit-2-mln-na-5-let/', folder: 'calc/kredit-2-mln-na-5-let', title: 'Кредит 2 000 000 ₽ на 5 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте кредит 2 000 000 ₽ на 5 лет. Ежемесячный платёж, переплата. Актуальные ставки 2026.' },
  { path: '/calc/kredit-3-mln-na-7-let/', folder: 'calc/kredit-3-mln-na-7-let', title: 'Кредит 3 000 000 ₽ на 7 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте кредит 3 000 000 ₽ на 7 лет. Ежемесячный платёж, переплата. Актуальные ставки 2026.' },
  { path: '/calc/vklad-1-mln-na-1-god/', folder: 'calc/vklad-1-mln-na-1-god', title: 'Вклад 1 000 000 ₽ на 1 год — доходность 2026 | Считай.RU', description: 'Рассчитайте доходность вклада 1 000 000 ₽ на 12 месяцев. Проценты, итоговая сумма. Ставки 2026.' },
  { path: '/calc/vklad-500-tysyach-na-6-mesyacev/', folder: 'calc/vklad-500-tysyach-na-6-mesyacev', title: 'Вклад 500 000 ₽ на 6 месяцев — доходность 2026 | Считай.RU', description: 'Рассчитайте доходность вклада 500 000 ₽ на 6 месяцев. Проценты, итоговая сумма. Ставки 2026.' },
  { path: '/calc/vklad-3-mln-na-1-god/', folder: 'calc/vklad-3-mln-na-1-god', title: 'Вклад 3 000 000 ₽ на 1 год — доходность 2026 | Считай.RU', description: 'Рассчитайте доходность вклада 3 000 000 ₽ на 12 месяцев. Проценты, итоговая сумма. Ставки 2026.' },
  { path: '/calc/semejnaya-ipoteka-6-procentov-2026/', folder: 'calc/semejnaya-ipoteka-6-procentov-2026', title: 'Семейная ипотека 6% в 2026 — расчёт платежа | Считай.RU', description: 'Рассчитайте семейную ипотеку под 6% годовых. Ежемесячный платёж, переплата, условия программы 2026.' },
  { path: '/calc/it-ipoteka-5-procentov-2026/', folder: 'calc/it-ipoteka-5-procentov-2026', title: 'IT-ипотека 5% в 2026 — расчёт платежа | Считай.RU', description: 'Рассчитайте IT-ипотеку под 5% годовых. Ежемесячный платёж, переплата, условия для IT-специалистов.' },
  { path: '/calc/avtokredit-1-5-mln-na-5-let/', folder: 'calc/avtokredit-1-5-mln-na-5-let', title: 'Автокредит 1 500 000 ₽ на 5 лет — расчёт 2026 | Считай.RU', description: 'Рассчитайте автокредит 1 500 000 ₽ на 5 лет. Ежемесячный платёж, переплата. Ставки 2026.' },
  { path: '/calc/ipoteka-4-mln-na-15-let/', folder: 'calc/ipoteka-4-mln-na-15-let', title: 'Ипотека 4 млн на 15 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 4 000 000 ₽ на 15 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/ipoteka-8-mln-na-25-let/', folder: 'calc/ipoteka-8-mln-na-25-let', title: 'Ипотека 8 млн на 25 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 8 000 000 ₽ на 25 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/ipoteka-12-mln-na-20-let/', folder: 'calc/ipoteka-12-mln-na-20-let', title: 'Ипотека 12 млн на 20 лет — расчёт платежа 2026 | Считай.RU', description: 'Рассчитайте ипотеку 12 000 000 ₽ на 20 лет. Ежемесячный платёж, переплата, график. Актуальные ставки 2026.' },
  { path: '/calc/vklad-2-mln-na-1-god/', folder: 'calc/vklad-2-mln-na-1-god', title: 'Вклад 2 000 000 ₽ на 1 год — доходность 2026 | Считай.RU', description: 'Рассчитайте доходность вклада 2 000 000 ₽ на 12 месяцев. Проценты, итоговая сумма. Ставки 2026.' },
  { path: '/calc/vklad-5-mln-na-1-god/', folder: 'calc/vklad-5-mln-na-1-god', title: 'Вклад 5 000 000 ₽ на 1 год — доходность 2026 | Считай.RU', description: 'Рассчитайте доходность вклада 5 000 000 ₽ на 12 месяцев. Проценты, итоговая сумма. Ставки 2026.' },
];

function loadSeoLandingRoutes() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/seoLandings.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const landingRoutes = [];
    let current = null;

    for (const line of lines) {
      const slugMatch = line.match(/slug:\s*'([^']+)'/);
      if (slugMatch) {
        current = { slug: slugMatch[1] };
        continue;
      }

      if (current && line.includes('title:')) {
        current.title = line.match(/title:\s*'([^']*)'/)?.[1] || '';
      }

      if (current && line.includes('description:')) {
        current.description = line.match(/description:\s*'([^']*)'/)?.[1] || '';
      }

      if (current && line.trim().startsWith('},')) {
        if (current.slug && current.title && current.description) {
          landingRoutes.push({
            path: `/calc/${current.slug}/`,
            folder: `calc/${current.slug}`,
            title: current.title,
            description: current.description,
          });
        }
        current = null;
      }
    }

    return landingRoutes;
  } catch (error) {
    console.warn('⚠️  Не удалось загрузить SEO-лендинги для статической генерации:', error.message);
    return [];
  }
}

const generatedSeoLandingRoutes = loadSeoLandingRoutes();
const routesWithSeo = [
  ...routes,
  ...generatedSeoLandingRoutes.filter((route) => !routes.some((existingRoute) => existingRoute.path === route.path)),
];

console.log(`📄 SEO-лендинги для статической генерации: ${generatedSeoLandingRoutes.length}`);

// Получаем entry point файл из assets (берём самый большой index-*.js — это главный бандл)
function getEntryPoint() {
  const assetsPath = path.join(process.cwd(), 'dist', 'assets');
  const files = fs.readdirSync(assetsPath);
  const indexFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
  if (indexFiles.length === 0) return '/assets/index.js';
  
  // Находим самый большой файл — это главный бандл приложения
  let largestFile = '';
  let largestSize = 0;
  for (const file of indexFiles) {
    const stats = fs.statSync(path.join(assetsPath, file));
    if (stats.size > largestSize) {
      largestSize = stats.size;
      largestFile = file;
    }
  }
  return `/assets/${largestFile}`;
}

// Получаем CSS файл
function getCSSFile() {
  const assetsPath = path.join(process.cwd(), 'dist', 'assets');
  const files = fs.readdirSync(assetsPath);
  const cssFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
  return cssFile ? `/assets/${cssFile}` : null;
}

// Базовый HTML шаблон
function generateHTML(route) {
  const baseUrl = 'https://schitay-online.ru';
  const fullUrl = `${baseUrl}${route.path}`;
  const canonicalUrl = route.path === '/' ? baseUrl : fullUrl;
  const entryPoint = getEntryPoint();
  const cssFile = getCSSFile();
  
  const cssLink = cssFile ? `  <link rel="stylesheet" crossorigin href="${cssFile}">\n` : '';
  const gaId = 'G-K1W27063WG';
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${route.title}</title>
  <meta name="description" content="${route.description}" />
  <meta name="keywords" content="калькулятор онлайн, расчет ипотеки, калькулятор зарплаты, НДФЛ, ЖКХ, алименты, бесплатно, 2026" />
  <meta name="author" content="Считай.RU" />
  <meta name="robots" content="index, follow" />
  <meta name="yandex-verification" content="397cbe38123af0f0" />
  <meta name="yandex-verification" content="f18b1ee2dceedee3" />
  <meta name="yandex-verification" content="xtdkshawlc8vdfh1" />
  <meta name="msvalidate.01" content="8F67F3B77C281CB6889648894352F2C9" />
  
  <!-- Canonical URL (со слэшем для GitHub Pages) -->
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:image" content="${baseUrl}/og-image.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Считай.RU" />
  <meta property="og:locale" content="ru_RU" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${fullUrl}" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  <meta name="twitter:image" content="${baseUrl}/og-image.png" />
  
  <!-- Favicon & PWA -->
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  
  <!-- Apple Touch Icon Settings -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Считай.RU">
  
  <!-- Safari Pin Tab -->
  <link rel="mask-icon" href="/icon.svg" color="#3B82F6">
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#3B82F6" />
  
  <!-- Additional PNG Icons for Desktop -->
  <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico">
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://mc.yandex.ru" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>

  <!-- Inter Cyrillic Variable Font - preload для LCP (русский текст) -->
  <link rel="preload" href="https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Non-blocking Google Fonts (prevent FOIT/FOUT) -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></noscript>

  <!-- Prevent FOUC: critical CSS inline -->
  <style>html{font-family:system-ui,-apple-system,sans-serif;line-height:1.5}body{margin:0;background:#0f172a;color:#f8fafc}</style>

${cssLink}  
  <!-- SPA Redirect Script -->
  <script type="text/javascript">
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
  
  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    ym(106217699, 'init', {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true,
      trackHash:true
    });
  </script>
  <!-- /Yandex.Metrika counter -->

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', { 'page_path': '${route.path}' });
  </script>
</head>

<body>
  <!-- Yandex.Metrika noscript -->
  <noscript><div><img src="https://mc.yandex.ru/watch/106217699" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <!-- /Yandex.Metrika noscript -->
  <div id="root">
    <!-- SEO-контент: виден поисковым ботам, заменяется React при загрузке -->
    <div style="font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
      <header style="border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #f8fafc; font-size: 1.5rem;">${route.title}</h1>
        <p style="color: #94a3b8;">${route.description}</p>
      </header>
      <main>
        <nav aria-label="Навигация по калькуляторам">
          <h2 style="color: #f8fafc;">Популярные калькуляторы</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><a href="/calculator/mortgage/" style="color: #60a5fa;">Ипотечный калькулятор — расчет платежа 2026</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/salary/" style="color: #60a5fa;">Калькулятор зарплаты — НДФЛ, на руки</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/credit/" style="color: #60a5fa;">Кредитный калькулятор — аннуитет и дифференцированный</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/bmi/" style="color: #60a5fa;">Калькулятор ИМТ — индекс массы тела</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/utilities/" style="color: #60a5fa;">Калькулятор ЖКХ — коммунальные платежи 2026</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/alimony/" style="color: #60a5fa;">Калькулятор алиментов 2026</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/court-fee/" style="color: #60a5fa;">Калькулятор госпошлины в суд</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/fuel/" style="color: #60a5fa;">Калькулятор расхода топлива</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/deposit/" style="color: #60a5fa;">Калькулятор вкладов — доходность депозита</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/deposit-tax/" style="color: #60a5fa;">Калькулятор налога на вклады 2026</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/maternity-capital/" style="color: #60a5fa;">Калькулятор материнского капитала 2026</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/osago/" style="color: #60a5fa;">Калькулятор ОСАГО онлайн</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/investment/" style="color: #60a5fa;">Калькулятор доходности инвестиций</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/self-employed/" style="color: #60a5fa;">Калькулятор налогов для самозанятых</a></li>
            <li style="margin: 8px 0;"><a href="/calculator/tax-deduction/" style="color: #60a5fa;">Калькулятор налогового вычета</a></li>
          </ul>
          <h2 style="color: #f8fafc;">Разделы</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><a href="/blog/" style="color: #60a5fa;">Блог — финансовые статьи 2026</a></li>
            <li style="margin: 8px 0;"><a href="/all/" style="color: #60a5fa;">Все калькуляторы</a></li>
            <li style="margin: 8px 0;"><a href="/about/" style="color: #60a5fa;">О проекте</a></li>
            <li style="margin: 8px 0;"><a href="/contacts/" style="color: #60a5fa;">Контакты</a></li>
          </ul>
        </nav>
      </main>
      <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; color: #64748b;">
        <p>© 2026 Считай.RU — Бесплатные онлайн калькуляторы для России и СНГ. Все расчёты без регистрации.</p>
      </footer>
    </div>
  </div>
  <script type="module" src="${entryPoint}"></script>
  
  <!-- Schema.org Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Считай.RU",
    "alternateName": "Schitay Online",
    "url": "https://schitay-online.ru",
    "description": "Бесплатные онлайн калькуляторы для России и СНГ: ипотека, кредит, зарплата, ЖКХ, налоги",
    "inLanguage": "ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://schitay-online.ru/all?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>
</body>
</html>`;
}

// Основная функция
function generateStaticFiles() {
  const distPath = path.resolve(process.cwd(), 'dist');
  
  // Проверяем существование dist
  if (!fs.existsSync(distPath)) {
    console.error('❌ Папка dist не найдена. Сначала выполните: npm run build');
    process.exit(1);
  }
  
  console.log('🚀 Генерация статических HTML файлов (со слэшем)...\n');
  
  let generatedCount = 0;
  
  routesWithSeo.forEach(route => {
    // Google verification file - copy as-is instead of generating HTML
    if (route.isGoogleVerification) {
      const srcPath = path.resolve(process.cwd(), 'public', path.basename(route.path));
      const destPath = path.join(distPath, path.basename(route.path));
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ ${route.path} → ${path.relative(distPath, destPath)} (copied)`);
        generatedCount++;
      }
      return;
    }
    
    const htmlContent = generateHTML(route);
    
    // Создаем папку с index.html
    let dirPath;
    if (route.folder === '.') {
      dirPath = distPath;
    } else {
      dirPath = path.join(distPath, route.folder);
    }
    
    // Создаем директорию
    fs.mkdirSync(dirPath, { recursive: true });
    
    // Путь к index.html
    const filePath = path.join(dirPath, 'index.html');
    
    // Записываем файл
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`✅ ${route.path} → ${path.relative(distPath, filePath)}`);
    generatedCount++;
  });
  
  // Удаляем старые .html файлы
  routesWithSeo.forEach(route => {
    if (route.folder !== '.') {
      const htmlFile = path.join(distPath, `${route.folder}.html`);
      if (fs.existsSync(htmlFile)) {
        fs.unlinkSync(htmlFile);
        console.log(`🗑️ Удалён .html: ${path.relative(distPath, htmlFile)}`);
      }
    }
  });
  
  console.log(`\n✨ Сгенерировано ${generatedCount} HTML файлов`);
  console.log('📁 Структура: папка/index.html (URL со слэшем)');
}

// Запуск
console.log('========================================');
console.log('   Генератор статических HTML файлов');
console.log('   (папки с index.html - URL со слэшем)');
console.log('========================================\n');

try {
  generateStaticFiles();
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}
