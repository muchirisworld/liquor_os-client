import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Eye, EyeOff } from '@hugeicons/core-free-icons'
import { Label } from '../ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group'
import { Button } from '../ui/button'
import type z from 'zod'
import { signInFormSchema } from '@/lib/validators'

type TSignInFormSchema = z.infer<typeof signInFormSchema>

const SignInForm = () => {
  const form = useForm({
    validators: { onSubmit: signInFormSchema },
    defaultValues: {
      email: '',
      password: '',
    } as TSignInFormSchema,
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  const [isVisible, setIsVisible] = useState<boolean>(false)

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)

  return (
    <form action={() => form.handleSubmit()} className="space-y-4">
      {/* Email Field */}
      <form.Field
        name="email"
        children={({ name, state, handleBlur, handleChange }) => {
          const invalid = state.meta.errors.length > 0 && state.meta.isTouched

          return (
            <div className="space-y-2">
              <Label
                className={invalid ? 'text-destructive' : ''}
                htmlFor={name}
              >
                Email
              </Label>
              <InputGroup>
                <InputGroupInput
                  id={name}
                  name={name}
                  type="email"
                  aria-invalid={invalid}
                  placeholder="email@example.com"
                  value={state.value}
                  onBlur={handleBlur}
                  onChange={(e) => handleChange(e.target.value)}
                />
            </InputGroup>

            {invalid &&
                state.meta.errors.map((e, idx) => (
                <p key={idx} className="text-sm text-destructive">
                    {e?.message}
                </p>
                ))}
            </div>
          )
        }}
      />

      {/* Password Field */}
      <form.Field
        name="password"
        children={({ name, state, handleBlur, handleChange }) => {
          const invalid = state.meta.errors.length > 0 && state.meta.isTouched

          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label
                  className={invalid ? 'text-destructive' : ''}
                  htmlFor={name}
                >
                  Password
                </Label>
                <a href={'/auth/sign-in'} className="hover:underline">
                  Forgot password?
                </a>
              </div>
              <InputGroup>
                <InputGroupInput
                  id={name}
                  name={name}
                  aria-invalid={invalid}
                  type={isVisible ? 'text' : 'password'}
                  placeholder={isVisible ? 'password' : '*******'}
                  value={state.value}
                  onBlur={handleBlur}
                  onChange={(e) => handleChange(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label="Copy"
                    title="Copy"
                    size="icon-xs"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <HugeiconsIcon
                        icon={EyeOff}
                        aria-hidden="true"
                        size={16}
                      />
                    ) : (
                      <HugeiconsIcon icon={Eye} aria-hidden="true" size={16} />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>

              </InputGroup>
              
                {invalid &&
                  state.meta.errors.map((e, idx) => (
                    <p key={idx} className="text-sm text-destructive">
                      {e?.message}
                    </p>
                  ))}
            </div>
          )
        }}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            className="w-full"
            size="lg"
            type="submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        )}
      ></form.Subscribe>
    </form>
  )
}

export default SignInForm
