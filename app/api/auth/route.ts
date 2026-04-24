import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * POST: User login or signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body; // action: 'login' or 'signup'

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    if (action === 'signup') {
      // Check if user exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: body.name || email.split('@')[0],
        },
        select: { id: true, email: true, name: true },
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        status: 'success',
        data: { user, token },
      });
    }

    if (action === 'login') {
      // Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const valid = await bcryptjs.compare(password, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
