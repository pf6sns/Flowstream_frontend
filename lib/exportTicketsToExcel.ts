/**
 * Builds a professional Excel workbook with two sheets:
 * - IT Support (Tech): Jira tickets
 * - Product Support (Non-Tech): ServiceNow tickets
 * Company name on top, bold headers, borders, full ticket details.
 */
import ExcelJS from 'exceljs'

const COMPANY_NAME = 'Flowstream'
const HEADERS = [
    'Ticket ID',
    'Subject',
    'Description',
    'Status',
    'Assigned To',
    'Priority',
    'Category',
    'Source',
    'Created Date',
    'Updated Date',
] as const

/** Convert Jira ADF or any value to plain text for export */
function descriptionToText(value: unknown): string {
    if (value == null) return ''
    if (typeof value === 'string') return value
    if (typeof value !== 'object') return String(value)
    const obj = value as { content?: unknown[]; text?: string }
    if (Array.isArray(obj.content)) return obj.content.map((n: unknown) => descriptionToText(n)).join('')
    if (typeof obj.text === 'string') return obj.text
    return ''
}

function formatDate(value: unknown): string {
    if (value == null) return '—'
    if (typeof value === 'string') {
        try {
            const d = new Date(value)
            return isNaN(d.getTime()) ? String(value) : d.toLocaleString()
        } catch {
            return String(value)
        }
    }
    return String(value)
}

function fillSheet(
    worksheet: ExcelJS.Worksheet,
    tickets: any[],
) {
    // Row 1: Company name
    const companyCell = worksheet.getCell(1, 1)
    companyCell.value = COMPANY_NAME
    companyCell.font = { bold: true, size: 14 }
    worksheet.mergeCells(1, 1, 1, HEADERS.length)

    // Row 2: empty
    // Row 3: Headers
    HEADERS.forEach((label, colIndex) => {
        const cell = worksheet.getCell(3, colIndex + 1)
        cell.value = label
        cell.font = { bold: true }
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        }
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8F0FA' },
        }
    })

    // Data rows
    tickets.forEach((ticket, rowIndex) => {
        const row = 4 + rowIndex
        const ticketId = ticket.servicenowTicketId || ticket.jiraTicketId || ticket._id || '—'
        const subject = typeof ticket.subject === 'string' ? ticket.subject : (ticket.subject ? String(ticket.subject) : '—')
        const description = descriptionToText(ticket.description)
        const values = [
            ticketId,
            subject,
            description || '—',
            ticket.status ?? '—',
            ticket.assignedTo ?? '—',
            ticket.priority ?? '—',
            ticket.category ?? '—',
            ticket.source ?? '—',
            formatDate(ticket.createdAt),
            formatDate(ticket.updatedAt),
        ]
        values.forEach((value, colIndex) => {
            const cell = worksheet.getCell(row, colIndex + 1)
            cell.value = value
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            }
        })
    })

    // Column widths (Ticket ID, Subject, Description, then rest)
    HEADERS.forEach((_, i) => {
        const col = worksheet.getColumn(i + 1)
        if (i === 0) col.width = 18
        else if (i === 1) col.width = 36
        else if (i === 2) col.width = 48
        else col.width = 14
    })
}

export async function buildTicketsWorkbook(tickets: any[]): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = COMPANY_NAME
    workbook.created = new Date()

    const techTickets = tickets.filter((t) => t.source === 'Jira')
    const nonTechTickets = tickets.filter((t) => t.source === 'ServiceNow')

    const sheetTech = workbook.addWorksheet('IT Support (Tech)', {
        headerFooter: { firstHeader: COMPANY_NAME },
    })
    fillSheet(sheetTech, techTickets)

    const sheetNonTech = workbook.addWorksheet('Product Support (Non-Tech)', {
        headerFooter: { firstHeader: COMPANY_NAME },
    })
    fillSheet(sheetNonTech, nonTechTickets)

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer as ExcelJS.Buffer
}

export function downloadExcelBuffer(buffer: ExcelJS.Buffer, filename: string) {
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
