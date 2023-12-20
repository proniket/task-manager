import prisma from '@/app/utils/connect';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized', status: 401 });
		}

		const { title, description, date, completed, important } =
			await req.json();
		const { id } = params;

		if (!title || !description || !date) {
			return NextResponse.json({
				error: 'Missing required fields',
				status: 400,
			});
		}

		if (title.length < 3) {
			return NextResponse.json({
				error: 'Title must be at least 3 characters long',
				status: 400,
			});
		}

		const task = await prisma.task.update({
			where: {
				id,
			},
			data: {
				title,
				description,
				date,
				isCompleted: completed,
				isImportant: important,
				userId,
			},
		});

		return NextResponse.json(task);
	} catch (error) {
		console.log('ERROR PUTTING TASK: ', error);
		return NextResponse.json({ error: 'Error putting task', status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = auth();
		const { id } = params;

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const task = await prisma.task.delete({
			where: {
				id,
			},
		});

		return NextResponse.json(task);
	} catch (error) {
		console.log('ERROR DELETING TASK: ', error);
		return NextResponse.json({ error: 'Error deleting task', status: 500 });
	}
}

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = auth();
		const { id } = params;

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized', status: 401 });
		}

		const task = await prisma.task.findFirst({
			where: {
				id,
				userId,
			},
		});

		return NextResponse.json(task);
	} catch (error) {
		console.log('ERROR GETTING TASK: ', error);
		return NextResponse.json({ error: 'Error editing task', status: 500 });
	}
}
