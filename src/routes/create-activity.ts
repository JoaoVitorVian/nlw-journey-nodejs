import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify/types/instance";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";

export async function createActivity(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
        schema:{
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                title: z.string().min(4),
                occurs_at: z.coerce.date(),
            }),
        }
    }, async (request, reply) => {
        const { tripId } = request.params;
        const { title, occurs_at } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })

        if(!trip){
            throw new Error('Viagem não encontrada!');
        }

        if(dayjs(occurs_at).isBefore(trip.starts_at)){
            throw new Error('Data invalida!');	
        }

        if(dayjs(occurs_at).isAfter(trip.ends_at)){
           throw new Error('Data invalida!');	
        }

        const activity = await prisma.activity.create({ 
            data: {
                title,
                occurs_at,
                trip_id: tripId,
            }
        })

        return{ activityId: activity.id}
    })}