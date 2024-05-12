import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class LoggerDatabase {
    private static instance: LoggerDatabase;

    private constructor() {}

    public static getInstance(): LoggerDatabase {
        if (!LoggerDatabase.instance) {
            LoggerDatabase.instance = new LoggerDatabase();
        } 
        return LoggerDatabase.instance;
    }

    public async log(): Promise<void> {
        const dateTime = new Date();
        try {
            const lastRecord = await prisma.sregistro_operaciones.findFirst({
                orderBy: { regi_idregistro: 'desc' }
            }); /// ir al ultimo registro

            let regi_idregistro: number;
            if (lastRecord && lastRecord.regi_idregistro) { /// verifica si lastRecord existe (es decir, si no es null o undefined) y si lastRecord.regi_idregistro también existe y tiene un valor definido
                regi_idregistro = lastRecord.regi_idregistro + 1;
            } else {
                regi_idregistro = 1; /// si no hay registros anteriores
            }

            await prisma.sregistro_operaciones.create({
                data: { // Solo los recibo
                    regi_fecha: dateTime,
                    regi_hora: dateTime, /// Fecha y hora sistema que está en la base de datos.
                    regi_idusuario: "1",
                    regi_accion: "ALTA",
                    regi_idmodulo: "M022",
                    regi_idregistro: regi_idregistro, /// ID registro seria el id de log?
                    regi_idoperacion: "1", /// Recibo como parámetro, es un ID de alta de usuario (ejemplo)
                    regi_tabla: "Alumnos", /// Depende la tabla que haya querido consultar
                    regi_tipooperacion: "Consulta" // Depende la operacion que haya querido hacer
                }
            });
            console.log("Nuevo registro creado correctamente.");
        } catch (error) {
            console.error("Error al crear el registro:", error);
            throw error;
        }
    }
}

async function main() {
    const loggerInstance = LoggerDatabase.getInstance();
    await loggerInstance.log();
}

main().catch(err => {
    console.error('Error:', err);
}).finally(async () => {
    await prisma.$disconnect();
});
