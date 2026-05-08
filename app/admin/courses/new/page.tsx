import Link from 'next/link';
import { createCourseAction } from '@/lib/admin/course-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const dynamic = 'force-dynamic';

export default function AdminNewCoursePage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <Link
          href="/admin/courses"
          className="text-xs font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          ← Courses
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
          New course
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          You can change details anytime while the course stays in Draft. After
          you create the course, open <span className="font-medium">Course Studio</span>{' '}
          to upload cover art — drag-and-drop or URL — so it matches what learners
          see on cards and the dashboard.
        </p>
      </div>

      <form
        action={createCourseAction}
        className="space-y-5 rounded-[1.75rem] border border-white/85 bg-white/82 p-6 shadow-[0_22px_64px_-44px_rgba(120,83,45,0.44)] backdrop-blur-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="title" className="text-stone-800">
            Course title
          </Label>
          <Input
            id="title"
            name="title"
            required
            className="border-stone-200 bg-white text-stone-950 placeholder:text-stone-400"
            placeholder="e.g. Glow Flow Method"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-stone-800">
            URL slug (optional)
          </Label>
          <Input
            id="slug"
            name="slug"
            className="border-stone-200 bg-white text-stone-950 placeholder:text-stone-400"
            placeholder="auto-generated from title if empty"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-stone-800">
            Short description
          </Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950 placeholder:text-stone-400"
            placeholder="What learners will get from this course"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryLocale" className="text-stone-800">
              Primary language
            </Label>
            <select
              id="primaryLocale"
              name="primaryLocale"
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950"
              defaultValue="en"
            >
              <option className="bg-white text-stone-950" value="en">
                English
              </option>
              <option className="bg-white text-stone-950" value="es">
                Español
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessMode" className="text-stone-800">
              Access
            </Label>
            <select
              id="accessMode"
              name="accessMode"
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950"
              defaultValue="subscription"
            >
              <option className="bg-white text-stone-950" value="subscription">
                Subscription
              </option>
              <option className="bg-white text-stone-950" value="free">
                Free
              </option>
            </select>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full rounded-full bg-stone-950 text-white hover:bg-stone-800"
        >
          Create course
        </Button>
      </form>
    </div>
  );
}
