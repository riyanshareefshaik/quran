export function getDaysUntil(targetDate: Date): number {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getReligiousCounters() {
    const now = new Date();

    // Estimates for 2026 (1447 AH)
    const ramadanStart = new Date('2026-02-18');
    const eidAlFitr = new Date('2026-03-20');
    const eidAlAdha = new Date('2026-05-27');

    let ramadanDays = getDaysUntil(ramadanStart);
    let eidFitrDays = getDaysUntil(eidAlFitr);
    let eidAdhaDays = getDaysUntil(eidAlAdha);

    return {
        isRamadan: now >= ramadanStart && now < eidAlFitr,
        daysToRamadan: ramadanDays > 0 ? ramadanDays : 0,
        daysToEidFitr: eidFitrDays > 0 ? eidFitrDays : 0,
        daysToEidAdha: eidAdhaDays > 0 ? eidAdhaDays : 0,
    };
}
