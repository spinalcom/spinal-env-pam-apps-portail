<template>

    <table class="elevation-1">
        <thead>
            <tr>
                <th>ID Statique</th>
                <th class="header">Nom</th>
                <th>Clé</th>
                <th>De</th>
                <th>À</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in flattenedDifferences" :key="item.staticId">
                <td>{{ item.staticId }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.key }}</td>
                <td>{{ item.from }}</td>
                <td>{{ item.to }}</td>
            </tr>
        </tbody>
    </table>
</template>
<script>
export default {
    props: ['dataTab'],
    data: () => ({
       
        
    }),

    methods: {
        flattenedDifferences(tab) {
            let results = [];
            tab?.forEach((item) => {
                Object.entries(item.differences).forEach(([key, value]) => {
                    results.push({
                        staticId: item.staticId,
                        name: item.name,
                        key: key,
                        from: value.from,
                        to: value.to,
                    });
                });
            });
            console.log(results, 'Le result de flattened differences');

            return results;
        },
    },

    watch: {
        dataTab(newVal, oldVal) {
            console.log('laslalsalslalslaslaslaslals', newVal);
            // this.flattenedDifferences(newVal)
        },
    }
}


</script>
<style scoped>
.header{
    /* margin-left: 50px; */
}
</style>