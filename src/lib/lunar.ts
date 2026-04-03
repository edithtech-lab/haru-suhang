// 간이 음력 변환 + 불교 기념일
// 실제 음력 변환은 복잡하므로 2024-2027년 주요 날짜를 하드코딩하고,
// 매월 보름(15일)/초하루(1일) 기반 불교 기념일을 표시

interface BuddhistHoliday {
  name: string
  lunarMonth: number
  lunarDay: number
  description: string
}

// 불교 주요 기념일 (음력 기준)
export const BUDDHIST_HOLIDAYS: BuddhistHoliday[] = [
  { name: '신정 (음력 설)', lunarMonth: 1, lunarDay: 1, description: '새해 첫날, 사찰에서 새해 발원' },
  { name: '정월대보름', lunarMonth: 1, lunarDay: 15, description: '연등 밝히고 소원 기원' },
  { name: '출가재일', lunarMonth: 2, lunarDay: 8, description: '석가모니 부처님 출가일' },
  { name: '부처님오신날', lunarMonth: 4, lunarDay: 8, description: '석가모니 부처님 탄생일' },
  { name: '우란분절 (백중)', lunarMonth: 7, lunarDay: 15, description: '돌아가신 분들을 위한 천도재' },
  { name: '성도재일', lunarMonth: 12, lunarDay: 8, description: '석가모니 부처님 깨달음을 얻은 날' },
  { name: '열반재일', lunarMonth: 2, lunarDay: 15, description: '석가모니 부처님 열반일' },
]

// 매월 초하루/보름 (음력 기준 불교 행사일)
export const MONTHLY_PRACTICES = [
  { lunarDay: 1, name: '초하루', description: '사찰 정기법회, 기도 시작일' },
  { lunarDay: 8, name: '관음재일', description: '관세음보살 기도일' },
  { lunarDay: 15, name: '보름', description: '보름 법회, 포살일' },
  { lunarDay: 18, name: '지장재일', description: '지장보살 기도일' },
  { lunarDay: 23, name: '세지재일', description: '대세지보살 기도일' },
  { lunarDay: 24, name: '지장재일', description: '지장보살 기도일' },
]

// 양력→음력 대응표 (2025-2027년 부처님오신날 등 주요일)
// 실제 프로덕션에서는 korean-lunar-calendar 같은 라이브러리 사용 권장
const SOLAR_HOLIDAYS: Record<string, { name: string; description: string }> = {
  // 2025년
  '2025-01-29': { name: '음력 설(1/1)', description: '새해 첫날' },
  '2025-02-12': { name: '정월대보름', description: '연등 기원' },
  '2025-03-06': { name: '출가재일(2/8)', description: '부처님 출가일' },
  '2025-05-05': { name: '부처님오신날', description: '석가탄신일' },
  '2025-09-07': { name: '백중(7/15)', description: '우란분절' },
  '2025-12-27': { name: '성도재일(12/8)', description: '부처님 성도일' },
  // 2026년
  '2026-02-17': { name: '음력 설(1/1)', description: '새해 첫날' },
  '2026-03-03': { name: '정월대보름', description: '연등 기원' },
  '2026-03-26': { name: '출가재일(2/8)', description: '부처님 출가일' },
  '2026-05-24': { name: '부처님오신날', description: '석가탄신일' },
  '2026-09-27': { name: '백중(7/15)', description: '우란분절' },
  '2026-12-16': { name: '성도재일(12/8)', description: '부처님 성도일' },
  // 2027년
  '2027-02-07': { name: '음력 설(1/1)', description: '새해 첫날' },
  '2027-02-21': { name: '정월대보름', description: '연등 기원' },
  '2027-03-15': { name: '출가재일(2/8)', description: '부처님 출가일' },
  '2027-05-13': { name: '부처님오신날', description: '석가탄신일' },
  '2027-09-16': { name: '백중(7/15)', description: '우란분절' },
  '2027-12-06': { name: '성도재일(12/8)', description: '부처님 성도일' },
}

export function getHolidayForDate(dateStr: string): { name: string; description: string } | null {
  return SOLAR_HOLIDAYS[dateStr] || null
}

export function getMonthHolidays(year: number, month: number): Record<string, { name: string; description: string }> {
  const result: Record<string, { name: string; description: string }> = {}
  const prefix = `${year}-${String(month).padStart(2, '0')}`

  for (const [date, info] of Object.entries(SOLAR_HOLIDAYS)) {
    if (date.startsWith(prefix)) {
      result[date] = info
    }
  }

  return result
}
