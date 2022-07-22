<div class="space-y-6">
    <x-ark-select :errors="$errors" name="state.user_id" required>
        <option value="" disabled selected>Select user...</option>
        @foreach(App\Models\User::orderBy('name')->cursor() as $user)
            <option value="{{ $user->id }}">
                {{ $user->name }}
            </option>
        @endforeach
    </x-ark-select>

    <x-ark-input :errors="$errors" name="state.title" required />

    <x-ark-markdown name="state.body" toolbar="full" />

    <x-ark-select :errors="$errors" name="state.category" required>
        <option value="" disabled selected>Choose category...</option>
        @foreach(BlogCategory::cases() as $category)
            <option value="{{ $category->value }}">
                {{ $category->label() }}
            </option>
        @endforeach
    </x-ark-select>

    <x-ark-input :errors="$errors" type="file" name="state.banner" required />

    <x-ark-input :errors="$errors" type="datetime-local" name="state.published_at" />

    <button type="button" wire:click="save" class="button-primary">Save</button>
</div>
