<div
    x-data="{ isDirty: {{ !! ($value ?? false) ? 'true' : 'false' }} }"
    {{ $attributes->only('class') }}
>
    <div class="input-group">
        @unless ($hideLabel ?? false)
            @include('ark::inputs.includes.input-label', [
                'name'           => $name,
                'errors'         => $errors,
                'id'             => $id ?? $name,
                'label'          => $label ?? null,
                'tooltip'        => $tooltip ?? null,
                'required'       => $required ?? false,
                'auxiliaryTitle' => $auxiliaryTitle ?? '',
            ])
        @endunless

        <div
            @class([
                'input-wrapper input-wrapper-with-prefix',
                'input-text--error' => $errors->has($name),
            ])
            x-bind:class="{ 'input-wrapper-with-prefix--dirty': !! isDirty }"
        >
            @if ($icon ?? false)
                @include('ark::inputs.includes.input-prefix-icon', [
                    'icon'     => $icon,
                    'position' => 'left',
                ])
            @elseif($prefix ?? false)
                <div @class(['input-prefix', $prefixClass ?? 'bg-theme-primary-50 dark:bg-theme-secondary-800'])>
                    {{ $prefix }}
                </div>
            @endif

            @include('ark::inputs.includes.input-field', [
                'name'           => $name,
                'errors'         => null,
                'id'             => $id ?? $name,
                'inputTypeClass' => 'input-text-with-prefix',
                'inputClass'     => $inputClass ?? '',
                'noModel'        => $noModel ?? false,
                'model'          => $model ?? $name,
                'deferred'       => $deferred ?? false,
                'debounce'       => $debounce ?? null,
                'attributes'     => $attributes->merge(['x-on:change' => 'isDirty = !! $event.target.value']),
            ])

            @error($name)
                @include('ark::inputs.includes.input-error-tooltip', [
                    'error' => $message,
                    'id' => $id ?? $name
                ])
            @enderror
        </div>
    </div>
</div>
