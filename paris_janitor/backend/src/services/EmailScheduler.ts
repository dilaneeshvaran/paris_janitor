import emailjs from 'emailjs-com';
import { format, addMonths, differenceInDays } from 'date-fns';
import { InvoiceUsecase } from '../domain/invoice-usecase';
import { UserUsecase } from '../domain/user-usecase';
import { AppDataSource } from '../database/database'; 

const SERVICE_ID = 'service_7z0c25j';
const TEMPLATE_ID = 'template_pt6nzmf';
const PUBLIC_KEY = 'y8pOzkgAPd8PgXyKt';

async function checkAndSendEmails() {
    const invoiceUsecase = new InvoiceUsecase(AppDataSource);
    const userUsecase = new UserUsecase(AppDataSource);
    const invoices = await invoiceUsecase.getVipInvoices();

    for (const invoice of invoices) {
        const paymentDate = new Date(invoice.date);
        const currentDate = new Date();
        const oneMonthLater = addMonths(paymentDate, 1);

        if (differenceInDays(oneMonthLater, currentDate) <= 0) {
            const user = await userUsecase.getUserById(invoice.client_id);
            if (user) {
                const templateParams = {
                    name: `${user.firstname} ${user.lastname}`,
                    user_email: user.email,
                    message: `Cher ${user.firstname}, La date de paiement pour votre abonnement VIP s'approche.`
                };

                emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
                    .then(() => {
                        console.log('Email sent successfully to', user.email);
                    })
                    .catch((error: any) => {
                        console.error('Failed to send email:', error);
                    });
            }
        }
    }
}

//schedule
import cron from 'node-cron';

cron.schedule('0 0 * * *', () => {
    checkAndSendEmails();
});
