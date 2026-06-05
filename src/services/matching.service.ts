import { Customer } from '@prisma/client';

export function calculateMatchScore(baseCustomer: Customer, candidateCustomer: Customer): number {
  if (baseCustomer.gender === candidateCustomer.gender) return 0;

  let score = 0;

  if (baseCustomer.gender === 'Male') {
    if (candidateCustomer.age < baseCustomer.age) score += 25;
    if (candidateCustomer.income <= baseCustomer.income) score += 20;
    if (candidateCustomer.height < baseCustomer.height) score += 20;
    if (baseCustomer.wantKids === candidateCustomer.wantKids) score += 35;
  } else {
    const degreeRank: Record<string, number> = { 'B.Com': 1, 'BBA': 1, 'B.Tech': 2, 'M.Sc': 2, 'MBA': 3, 'M.Tech': 3, 'CA': 4, 'MBBS': 4 };
    const baseRank = degreeRank[baseCustomer.degree] || 1;
    const candidateRank = degreeRank[candidateCustomer.degree] || 1;
    
    if (candidateRank >= baseRank) score += 20;
    if (candidateCustomer.designation === baseCustomer.designation || candidateCustomer.income > baseCustomer.income) score += 20;
    if (baseCustomer.diet === candidateCustomer.diet) score += 10;
    if (baseCustomer.drinking === candidateCustomer.drinking) score += 10;
    if (baseCustomer.familyType === candidateCustomer.familyType) score += 15;
    if (baseCustomer.openToRelocate === candidateCustomer.openToRelocate) score += 10;
    if (baseCustomer.wantKids === candidateCustomer.wantKids) score += 15;
  }

  return score;
}
